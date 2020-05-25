import { Controller, UseGuards } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Feature } from '../../entities/feature.entity';
import { FeatureService } from '../../services/feature/feature.service';
import { RoleCheckerGuard } from '../../misc/role.checker.guard';
import { AllowToRoles } from '../../misc/allow.to.roles.descriptor';

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
    },
    routes: {
        only: [
            'createOneBase',
            'createManyBase',
            'updateOneBase',
            'getManyBase',
            'getOneBase',
        ],
        createOneBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator')
            ]
        },
        createManyBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator')
            ]
        },
        updateOneBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator')
            ]
        },
        getManyBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', 'user')
            ]
        },
        getOneBase: {
            decorators: [
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', 'user')
            ]
        }
    }

})
export class FeatureController {
    constructor(public service: FeatureService) { }

}