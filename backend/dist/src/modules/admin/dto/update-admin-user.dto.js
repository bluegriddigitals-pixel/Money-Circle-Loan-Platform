"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAdminUserDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_admin_user_dto_1 = require("./create-admin-user.dto");
class UpdateAdminUserDto extends (0, mapped_types_1.PartialType)(create_admin_user_dto_1.CreateAdminUserDto) {
}
exports.UpdateAdminUserDto = UpdateAdminUserDto;
//# sourceMappingURL=update-admin-user.dto.js.map