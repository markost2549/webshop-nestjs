import { Controller } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Feature } from '../../entities/feature.entity';
import { FeatureService } from '../../services/feature/feature.service';

@Controller('api/feature')
@Crud({
    model: {
        type: Feature,
    },
    params: {
        id: {
            field: 'featureId',
            type: "number",
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            articleFeaties: {
                eager: false
            },
            articles: {
                eager: false
            }
        },
    }

})
export class FeatureController {
    constructor(public service: FeatureService) { }

}