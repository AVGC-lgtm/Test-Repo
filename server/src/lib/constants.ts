
// import type { ProductDatabase, UserRole, TabDefinition } from '@/types';
// import { BarChart3, Calendar, Camera, Package, Scale, Building, FileSearch, Shield, ClipboardEdit } from 'lucide-react';

// export const PRODUCT_DATABASE: ProductDatabase = {
//   pesticides: {
//     'UPL': {
//       'Saaf': {
//         activeIngredient: 'Carbendazim 12% + Mancozeb 63%',
//         packaging: ['100g', '250g', '500g'],
//         batchFormat: 'UPL-SAAF-YYYYMM-XXXXX',
//         commonCounterfeitMarkers: ['Poor print quality', 'Wrong shade of green', 'Missing hologram'],
//         mrp: { '100g': 120, '250g': 280, '500g': 520 }
//       },
//       'Ulala': {
//         activeIngredient: 'Flonicamid 50% WG',
//         packaging: ['100g', '500g'],
//         batchFormat: 'UPL-ULA-YYYYMM-XXXXX',
//         mrp: { '100g': 650, '500g': 3100 }
//       },
//       'Curacron': {
//         activeIngredient: 'Profenofos 50% EC',
//         packaging: ['250ml', '500ml', '1L'],
//         mrp: { '250ml': 480, '500ml': 940, '1L': 1850 }
//       }
//     },
//     'Bayer': {
//       'Confidor': {
//         activeIngredient: 'Imidacloprid 17.8% SL',
//         packaging: ['50ml', '100ml', '250ml', '500ml'],
//         hologramFeatures: ['3D hologram', 'Color-changing ink', 'Microtext'],
//         mrp: { '50ml': 165, '100ml': 320, '250ml': 785, '500ml': 1550 }
//       },
//       'Nativo': {
//         activeIngredient: 'Tebuconazole 50% + Trifloxystrobin 25%',
//         packaging: ['50g', '100g', '200g'],
//         mrp: { '50g': 570, '100g': 1120, '200g': 2200 }
//       }
//     },
//     'Syngenta': {
//       'Karate': {
//         activeIngredient: 'Lambda Cyhalothrin 5% EC',
//         packaging: ['100ml', '250ml', '500ml'],
//         mrp: { '100ml': 310, '250ml': 750, '500ml': 1480 }
//       },
//       'Ridomil Gold': {
//         activeIngredient: 'Metalaxyl-M 4% + Mancozeb 64%',
//         packaging: ['250g', '500g', '1kg'],
//         mrp: { '250g': 590, '500g': 1160, '1kg': 2280 }
//       }
//     }
//   },
//   fertilizers: {
//     'IFFCO': {
//       'DAP': {
//         composition: '18-46-0',
//         packaging: ['50kg'],
//         bagColor: 'Green with IFFCO logo',
//         subsidizedRate: 1350,
//         mrp: 1350
//       },
//       'NPK 10:26:26': {
//         composition: '10-26-26',
//         packaging: ['50kg'],
//         subsidizedRate: 1470,
//         mrp: 1470
//       }
//     },
//     'Coromandel': {
//       'Gromor': {
//         composition: '14-35-14',
//         packaging: ['50kg'],
//         bagColor: 'White with green stripes',
//         mrp: 1520
//       }
//     }
//   },
//   seeds: {
//     'Mahyco': {
//       'Bt Cotton': {
//         varieties: ['MECH-162', 'MECH-184'],
//         packaging: ['450g'],
//         mrp: { '450g': 930 }
//       }
//     },
//     'Nuziveedu': {
//       'Cotton Hybrid': {
//         varieties: ['Bhakti', 'Mallika'],
//         packaging: ['475g'],
//         mrp: { '475g': 980 }
//       }
//     }
//   }
// };

// export const USER_ROLES: UserRole = {
//   FIELD_OFFICER: 'Field Officer',
//   DAO: 'District Agricultural Officer',
//   LEGAL_OFFICER: 'Legal Officer',
//   LAB_COORDINATOR: 'Lab Coordinator',
//   HQ_MONITORING: 'HQ Monitoring Cell',
//   DISTRICT_ADMIN: 'District Admin'
// };

// export const TABS: TabDefinition[] = [
//   { 
//     id: 'dashboard', 
//     icon: BarChart3, 
//     text: 'Dashboard',
//     ariaLabel: 'View monitoring dashboard',
//     allowedRoles: [USER_ROLES.DAO, USER_ROLES.HQ_MONITORING, USER_ROLES.DISTRICT_ADMIN]
//   },
//   { 
//     id: 'inspection-planning', 
//     icon: Calendar, 
//     text: 'Inspection Planning',
//     ariaLabel: 'Plan inspection visits',
//     allowedRoles: [USER_ROLES.DISTRICT_ADMIN, USER_ROLES.DAO]
//   },
//   { 
//     id: 'field-execution', 
//     icon: Camera, 
//     text: 'Field Execution',
//     ariaLabel: 'Execute field inspections',
//     allowedRoles: [USER_ROLES.FIELD_OFFICER, USER_ROLES.DAO]
//   },
//   { 
//     id: 'seizure-logging', 
//     icon: Package, 
//     text: 'Seizure Logging',
//     ariaLabel: 'Log seized items',
//     allowedRoles: [USER_ROLES.FIELD_OFFICER, USER_ROLES.DAO]
//   },
//   { 
//     id: 'legal-module', 
//     icon: Scale, 
//     text: 'Legal Module',
//     ariaLabel: 'Legal enforcement',
//     allowedRoles: [USER_ROLES.LEGAL_OFFICER, USER_ROLES.DAO]
//   },
//   { 
//     id: 'lab-interface', 
//     icon: Building, 
//     text: 'Lab Interface',
//     ariaLabel: 'Lab sample tracking',
//     allowedRoles: [USER_ROLES.LAB_COORDINATOR, USER_ROLES.DAO]
//   },
//   { 
//     id: 'report-audit', 
//     icon: FileSearch, 
//     text: 'Reports & Audit',
//     ariaLabel: 'View reports and audit logs',
//     allowedRoles: [USER_ROLES.HQ_MONITORING, USER_ROLES.DAO, USER_ROLES.DISTRICT_ADMIN]
//   },
//   {
//     id: 'agri-forms-module', // New module ID
//     icon: ClipboardEdit, // New icon
//     text: 'Agri-Forms Portal',
//     ariaLabel: 'Access agricultural forms portal',
//     allowedRoles: [USER_ROLES.DAO, USER_ROLES.FIELD_OFFICER, USER_ROLES.DISTRICT_ADMIN] // Example roles
//   }
// ];

// export const APP_NAME = "Agrivigil";
// export const APP_LOGO = Shield;

// // Company Information
// export const COMPANY_INFO = {
//   name: "Dawell Lifescience Private Limited",
//   contact: "9850647444",
//   copyright: "© 2024 Agrivigil - Developed by Dawell Lifescience Private Limited. All rights reserved."
// };
