import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from '../../entities/cart.entity';
import { Repository } from 'typeorm';
import { CartArticle } from '../../entities/cart-article.entity';
import { Article } from '../../entities/article.entity';
import { Order } from '../../entities/order.entity';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cart: Repository<Cart>,

        @InjectRepository(CartArticle)
        private readonly cartArticle: Repository<CartArticle>,
    ) { }

    async getLastActiveCartByUserId(inputUserId: number): Promise<Cart | null> {
        const carts = await this.cart.find({
            where: {
                userId: inputUserId
            },
            order: {
                createdAt: "DESC",
            },
            take: 1,
            relations: ['order']
        });

        if (!carts || carts.length === 0) {
            return null;
        }

        const cart = carts[0];
        if (cart.order !== null) {
            return null;
        }

        return cart;
    }

    async createNewCartForUser(inputUserId: number): Promise<Cart> {
        const newCart: Cart = new Cart();
        newCart.userId = inputUserId;

        return await this.cart.save(newCart);
    }

    async addArticleToCart(cartId: number, articleId: number, quantity: number): Promise<Cart> {
        let record: CartArticle = await this.cartArticle.findOne({
            cartId: cartId,
            articleId: articleId,
        })

        if (!record) {
            record = new CartArticle();
            record.cartId = cartId;
            record.articleId = articleId;
            record.quantity = quantity;
        } else {
            record.quantity += quantity;
        }
        await this.cartArticle.save(record);

        return this.getById(cartId);
    }

    async getById(cartId: number): Promise<Cart> {
        return this.cart.findOne(cartId, {
            relations: [
                "user",
                "cartArticles",
                "cartArticles.article",
                "cartArticles.article.category",
                "cartArticles.article.articlePrices",
            ]
        });
    }

    async changeQuantity(cartId: number, articleId: number, quantity: number): Promise<Cart> {
        const record: CartArticle = await this.cartArticle.findOne({
            cartId: cartId,
            articleId: articleId,
        })

        if (record) {
            record.quantity = quantity;
            if (record.quantity === 0) {
                await this.cartArticle.delete(record.cartArticleId)
            } else {
                await this.cartArticle.save(record)
            }
        }

        return await this.getById(cartId);

    }
}