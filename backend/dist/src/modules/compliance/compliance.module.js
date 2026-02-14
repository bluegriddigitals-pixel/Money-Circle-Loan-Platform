"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const compliance_service_1 = require("./compliance.service");
const compliance_controller_1 = require("./compliance.controller");
const kyc_entity_1 = require("./entities/kyc.entity");
const kyc_document_entity_1 = require("./entities/kyc-document.entity");
const compliance_check_entity_1 = require("./entities/compliance-check.entity");
const sanction_screening_entity_1 = require("./entities/sanction-screening.entity");
const aml_alert_entity_1 = require("./entities/aml-alert.entity");
const user_entity_1 = require("../user/entities/user.entity");
const notification_module_1 = require("../notification/notification.module");
let ComplianceModule = class ComplianceModule {
};
exports.ComplianceModule = ComplianceModule;
exports.ComplianceModule = ComplianceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                kyc_entity_1.Kyc,
                kyc_document_entity_1.KycDocument,
                compliance_check_entity_1.ComplianceCheck,
                sanction_screening_entity_1.SanctionScreening,
                aml_alert_entity_1.AmlAlert,
                user_entity_1.User,
            ]),
            notification_module_1.NotificationModule,
        ],
        controllers: [compliance_controller_1.ComplianceController],
        providers: [compliance_service_1.ComplianceService],
        exports: [compliance_service_1.ComplianceService],
    })
], ComplianceModule);
//# sourceMappingURL=compliance.module.js.map