export class AddArticleDto {
  name: string;
  categoryId: number;
  excerpt: string;
  desccription: string;
  price: number;
  features: {
    featureId: number;
    value: string;
  }[];
}
