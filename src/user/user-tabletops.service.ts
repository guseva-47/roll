import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";

import { TabletopDto } from "src/tabletop/dto/tabletop.dto";
import { ITabletop } from "src/tabletop/interface/tabletop.interface";
import { TabletopService } from "src/tabletop/tabletop.service";
import { profilePrivatType } from "./enum/profile-privet-type.enum";
import { IUser } from "./interface/user.interface";
import { UserService } from "./user.service";

@Injectable()
export class UsersTabletopsService {
	constructor(
		private tabletopService: TabletopService,
		private userService: UserService,
	) { }

	// todo све игры пользователя, все игры где ты хозяин, исключиться из игры

	async getAllTabletops(idMe: string, idSomeUser?: string): Promise<Array<ITabletop>> {

		if (!idSomeUser || idMe === idSomeUser)
			return this.tabletopService.getAllTabletops(idMe);

		const userOther: IUser = await this.userService.getUser(idMe);
		if (userOther.profilePrivatType === profilePrivatType.closed && !userOther.subscribers.includes(idMe))
			throw new ForbiddenException();

		return this.tabletopService.getAllTabletops(userOther._id);
	}

	async getTabletop(idTabletop: string, idMe: string): Promise<ITabletop> {

		return this.tabletopService.getTabletop(idMe, idTabletop);
	}

	// async rightTransfer(idMe: string, idSomeUser: string, tabletop: TabletopDto): Promise<ITabletop> {

	//    if (idMe === idSomeUser) return this.getTabletop(tabletop._id, idMe);

	//    if (tabletop.owner !== idMe) throw new BadRequestException();

	//    return await this.tabletopService.rightTransfer(tabletop, idSomeUser);
	// }

	async editTabletop(idMe: string, tabletop: TabletopDto): Promise<ITabletop> {

        if (tabletop.owner !== idMe) throw new ForbiddenException();
        if (tabletop.name == '') throw new BadRequestException();
		return await this.tabletopService.updateTabletop(tabletop);
	}

	async removeTabletop(idMe: string, idTabletop: string): Promise<ITabletop> {

		return await this.tabletopService.removeTableTop(idMe, idTabletop);
	}

	async createTabletop(idMe: string, tabletop: TabletopDto): Promise<ITabletop> {
        if (tabletop.name == '') throw new BadRequestException;
		return await this.tabletopService.createTabletop(idMe, tabletop);
	}
}