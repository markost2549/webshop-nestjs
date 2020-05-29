import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Category } from "./category.entity";
import { ArticleFeature } from "./article-feature.entity";
import { ArticlePrice } from "./article-price.entity";
import { CartArticle } from "./cart-article.entity";
import { Photo } from "./photo.entity";
import { Feature } from "./feature.entity";
import * as Validator from 'class-validator';

@Index("fk_article_category_id", ["categoryId"], {})
@Entity("article")
export class Article {
  @PrimaryGeneratedColumn({ type: "int", name: "article_id", unsigned: true })
  articleId: number;

  //NAME
  @Column({ type: "varchar", name: "name", length: 128, default: () => "'0'" })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Length(5, 128)
  name: string;

  //CATEGORY_ID
  @Column({ type: "int", name: "category_id", unsigned: true, default: () => "'0'" })
  categoryId: number;

  @Column({ type: "varchar", name: "excerpt", length: 255, default: () => "'0'" })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Length(10, 255)
  excerpt: string;

  @Column({ type: "text", name: "description" })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Length(64, 10000)
  description: string;

  @Column({
    type: "enum",
    name: "status",
    enum: ["available", "visible", "hidden"],
    default: () => "'available'",
  })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.IsIn(["available", "visible", "hidden"])
  status: "available" | "visible" | "hidden";

  @Column({
    type: "tinyint",
    name: "is_promoted",
    unsigned: true,
    default: () => "'0'",
  })
  @Validator.IsNotEmpty()
  @Validator.IsIn([0, 1])
  isPromoted: number;

  @Column({
    type: "timestamp",
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => Category, (category) => category.articles, {
    onDelete: "NO ACTION",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
  category: Category;

  @OneToMany(() => ArticleFeature, (articleFeature) => articleFeature.article)
  articleFeatures: ArticleFeature[];

  @ManyToMany(type => Feature, feature => feature.articles)
  @JoinTable({
    name: 'article_feature',
    joinColumn: { name: 'article_id', referencedColumnName: 'articleId' },
    inverseJoinColumn: { name: 'feature_id', referencedColumnName: 'featureId' }
  })
  features: Feature[]

  @OneToMany(() => ArticlePrice, (articlePrice) => articlePrice.article)
  articlePrices: ArticlePrice[];

  @OneToMany(() => CartArticle, (cartArticle) => cartArticle.article)
  cartArticles: CartArticle[];

  @OneToMany(() => Photo, (photo) => photo.article)
  photos: Photo[];
}
