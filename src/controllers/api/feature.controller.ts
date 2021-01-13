import { Controller, UseGuards, Get, Param } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Feature } from '../../entities/feature.entity';
import { FeatureService } from '../../services/feature/feature.service';
import { RoleCheckerGuard } from '../../misc/role.checker.guard';
import { AllowToRoles } from '../../misc/allow.to.roles.descriptor';
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";

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

    @Get('values/:categoryId')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator', 'user')
    async getDistinctValuesByCategoryId(@Param('categoryId') categoryId: number): Promise<DistinctFeatureValuesDto> {
        return await this.service.getDistinctValuesByCategoryId(categoryId);
    }
}