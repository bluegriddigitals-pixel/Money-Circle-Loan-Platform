"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSystemConfigDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_system_config_dto_1 = require("./create-system-config.dto");
class UpdateSystemConfigDto extends (0, mapped_types_1.PartialType)(create_system_config_dto_1.CreateSystemConfigDto) {
}
exports.UpdateSystemConfigDto = UpdateSystemConfigDto;
//# sourceMappingURL=update-system-config.dto.js.map