import { OrderService } from '../../services/order/order.service';
import { Param, Get, UseGuards, Patch, Body, Controller } from '@nestjs/common';
import { ApiResponse } from '../../misc/api.response.class';
import { RoleCheckerGuard } from '../../misc/role.checker.guard';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { Order } from '../../entities/order.entity';
import { ChangeOrderStatusDto } from '../../dtos/order/change.order.status.dto';

@Controller('api/order')
export class AdmininstratorOrderController {
    constructor(
        private orderService: OrderService
    ) { }

    @Get(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async get(@Param('id') id: number): Promise<Order | ApiResponse> {
        const order = await this.orderService.getById(id)

        if (!order) {
            return new ApiResponse('error', -9001, 'No order found')
        }

        return order;
    }

    @Patch(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async changeStatus(@Param('id') id: number, @Body() data: ChangeOrderStatusDto): Promise<Order | ApiResponse> {
        return await this.orderService.changeStatus(id, data.newStatus);
    }
}