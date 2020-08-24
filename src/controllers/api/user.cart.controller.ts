import { Controller, Get, UseGuards, Req, Post, Body, Patch } from '@nestjs/common';
import { CartService } from '../../services/cart/cart.service';
import { RoleCheckerGuard } from '../../misc/role.checker.guard';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { Request } from 'express';
import { Cart } from '../../entities/cart.entity';
import { AddArticleToCartDto } from '../../dtos/cart/add.article.to.cart.dto';
import { EditArticleInCartDto } from '../../dtos/cart/edit.article.in.cart.dto';
import { Order } from '../../entities/order.entity';
import { OrderService } from '../../services/order/order.service';
import { ApiResponse } from '../../misc/api.response.class';
import { OrderMailerService } from '../../services/order/order.mailer.service';
import { MailConfig } from 'config/mail.configuration';

@Controller('api/user/cart')
export class UserCartController {
    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private orderMailer: OrderMailerService
    ) { }

    private async getActiveCartById(userId: number): Promise<Cart> {
        let cart = await this.cartService.getLastActiveCartByUserId(userId);
        if (!cart) {
            cart = await this.cartService.createNewCartForUser(userId)
        }
        return await this.cartService.getById(cart.cartId);
    }

    @Get()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    async getCurrentCart(@Req() req: Request): Promise<Cart> {
        return await this.getActiveCartById(req.token.id)
    }

    @Post('addToCart')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    async addToCart(@Body() data: AddArticleToCartDto, @Req() req: Request): Promise<Cart> {
        const cart = await this.getActiveCartById(req.token.id);

        return await this.cartService.addArticleToCart(cart.cartId, data.articleId, data.quantity)
    }

    @Patch()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    async changeQuantity(@Body() data: EditArticleInCartDto, @Req() req: Request): Promise<Cart> {
        const cart = await this.cartService.getLastActiveCartByUserId(req.token.id);
        return await this.cartService.changeQuantity(cart.cartId, data.articleId, data.quantity)
    }

    @Post('makeOrder')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    async makeOrder(@Req() req: Request): Promise<Order | ApiResponse> {
        const cart = await this.getActiveCartById(req.token.id);
        const order = await this.orderService.add(cart.cartId);

        if (order instanceof ApiResponse) {
            return order;
        }

        //Send email
        if (MailConfig.useEmail) {
            await this.orderMailer.sendOrderEmail(order)
        }

        return order;
    }

}