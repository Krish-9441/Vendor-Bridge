VendorBridge—Procurement&VendorManagement
ERP
Architecture,FolderStructure&APIContract(MERNStack)—v2.0
PreparedforAntigravityvibecodingbuild
August2026
Contents
1 0. HowtoUseThisDocument 4
1.1 DesignReferenceFiles . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 4
2 1. TechStack—MERN,JavaScriptOnly 5
3 2. ProductArchitecture 6
4 3. UserJourneys 7
4.1 ProcurementOfficer . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
4.2 Vendor. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
4.3 Manager/Approver . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
4.4 Admin. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7
5 4. DataModel(MongoDB/Mongoose) 8
5.1 4.1Collections&Schemas . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
5.1.1 User. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
5.1.2 Vendor. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
5.1.3 Rfq. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
5.1.4 Quotation. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
5.1.5 Approval. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
5.1.6 PurchaseOrder . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
5.1.7 Invoice. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
5.1.8 ActivityLog . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
5.1.9 Notification . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
5.2 4.2RelationshipDiagram . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
6 5. APIContract(Full,withPayloadSamples) 11
6.1 5.1Conventions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 11
6.2 5.2Auth— /api/v1/auth . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 12
6.2.1 POST /auth/signup . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 12
6.2.2 POST /auth/login . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 12
6.2.3 POST /auth/refresh . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
6.2.4 POST /auth/logout . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
6.2.5 POST /auth/forgot-password . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
6.2.6 POST /auth/reset-password . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
6.2.7 GET /auth/me . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
6.3 5.3Users(Admin)— /api/v1/users . . . . . . . . . . . . . . . . . . . . . . . . . . 13
6.3.1 GET /users. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
6.3.2 GET /users/:id ->200single Userobject,or 404 NOT_FOUND .. . . . . . . . . . 14
1
6.3.3 POST /users . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
6.3.4 PATCH /users/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
6.4 5.4Vendors— /api/v1/vendors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
6.4.1 GET /vendors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
6.4.2 GET /vendors/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15
6.4.3 POST /vendors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15
6.4.4 PATCH /vendors/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15
6.4.5 PATCH /vendors/:id/status . . . . . . . . . . . . . . . . . . . . . . . . . . . 15
6.5 5.5RFQs— /api/v1/rfqs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 16
6.5.1 GET /rfqs. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 16
6.5.2 GET /rfqs/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 16
6.5.3 POST /rfqs. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
6.5.4 PATCH /rfqs/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
6.5.5 POST /rfqs/:id/publish . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
6.5.6 POST /rfqs/:id/attachments . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
6.5.7 POST /rfqs/:id/vendors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
6.5.8 POST /rfqs/:id/cancel . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
6.6 5.6Quotations— /api/v1/rfqs/:rfqId/quotations and /api/v1/quotations . . . .17
6.6.1 GET /rfqs/:rfqId/quotations . . . . . . . . . . . . . . . . . . . . . . . . . . 18
6.6.2 GET /quotations/mine?rfqId=64f2a1b1c2d3e4f5a6b7c8d9 . . . . . . . . . . . 18
6.6.3 POST /rfqs/:rfqId/quotations . . . . . . . . . . . . . . . . . . . . . . . . . . 18
6.6.4 POST /quotations/:id/withdraw . . . . . . . . . . . . . . . . . . . . . . . . . 18
6.7 5.7Comparison&Selection— /api/v1/rfqs/:rfqId/comparison . . . . . . . . . . 18
6.7.1 GET /rfqs/:rfqId/comparison . . . . . . . . . . . . . . . . . . . . . . . . . . 18
6.7.2 POST /rfqs/:rfqId/select-quotation . . . . . . . . . . . . . . . . . . . . . . 19
6.8 5.8Approvals— /api/v1/approvals . . . . . . . . . . . . . . . . . . . . . . . . . . 19
6.8.1 GET /approvals . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
6.8.2 GET /approvals/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
6.8.3 POST /approvals/:id/decide . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
6.9 5.9PurchaseOrders— /api/v1/purchase-orders . . . . . . . . . . . . . . . . . . . 20
6.9.1 GET /purchase-orders . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
6.9.2 GET /purchase-orders/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
6.9.3 POST /purchase-orders . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
6.9.4 GET /purchase-orders/:id/pdf . . . . . . . . . . . . . . . . . . . . . . . . . . 21
6.105.10Invoices— /api/v1/invoices . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
6.10.1 GET /invoices . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
6.10.2 GET /invoices/:id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
6.10.3 POST /invoices . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
6.10.4 GET /invoices/:id/pdf . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
6.10.5 POST /invoices/:id/send-email . . . . . . . . . . . . . . . . . . . . . . . . . 22
6.10.6 PATCH /invoices/:id/status . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
6.115.11Notifications&Activity— /api/v1/notifications ,/api/v1/activity-logs . .22
6.11.1 GET /notifications . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
6.11.2 PATCH /notifications/:id/read ->200,marksread. . . . . . . . . . . . . . . 22
6.11.3 PATCH /notifications/read-all ->200.. . . . . . . . . . . . . . . . . . . . . 22
6.11.4 GET /activity-logs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
6.125.12Reports&Analytics— /api/v1/reports . . . . . . . . . . . . . . . . . . . . . 22
6.12.1 GET /reports/dashboard-summary . . . . . . . . . . . . . . . . . . . . . . . . 23
6.12.2 GET /reports/vendor-performance . . . . . . . . . . . . . . . . . . . . . . . . 23
6.12.3 GET /reports/spend-summary?from=2026-01-01&to=2026-08-20 . . . . . . . . 23
6.12.4 GET /reports/procurement-trends?months=6 . . . . . . . . . . . . . . . . . . 23
6.12.5 GET /reports/export?type=spend|vendor-performance&format=csv (optional-
tier, Section 9) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 23
7 6. BackendArchitecture(Node.js+Express+MongoDB,PlainJavaScript) 24
7.1 6.1FolderStructure . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 24
2
7.2 6.2LayeredResponsibility . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 26
7.3 6.3Cross-CuttingBackendRules . . . . . . . . . . . . . . . . . . . . . . . . . . . . 26
8 7. FrontendArchitecture(React+Vite,PlainJavaScript) 27
8.1 7.1FolderStructure . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 27
8.2 7.2StateManagementStrategy . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 28
8.3 7.3APIIntegrationPattern . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 28
8.4 7.4Routing&RoleGating . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 29
8.5 7.5DesignSystem . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 29
9 8. Authentication&Authorization 30
109. MVPvsOptionalFeatures 31
10.1MVP(mustworkend-to-endforthedemo) . . . . . . . . . . . . . . . . . . . . . . . 31
10.2Optional/Nice-to-have(onlyafterMVPissolid) . . . . . . . . . . . . . . . . . . . . 31
1110. ImplementationPhases 32
1211. HackathonDemoStrategy(5-10min) 33
1312. Risks 34
14AmendmentLog 35
3
1 0. HowtoUseThisDocument
Thisdocumentisthe singlesourceoftruth forbuildingVendorBridge.Itiswrittensoitcanbe
handeddirectlytoanAIvibecodingagent(Antigravity)orahumandeveloperwithnoadditional
contextneeded.
Rulesforimplementation:
1.Section5(APIContract )isFROZENoncethisdocumentisapproved.Everybackendroute
mustmatchitexactly—method,path,payloadshape,responseshape,statuscodes. Every
frontendcallmustconsumeitexactlyaswritten.
2.Donotinventnewresponseenvelopes,fieldnames,orstatuscodesthataren’tdefinedhere.
Ifsomethingismissing,flagitandextendthisdocumentfirst—donotimproviseinsidea
featurebranch.
3.FolderstructuresinSectionsEandFaremandatoryskeletons.Filesmaybeaddedinsidea
module,butthetop-levelmoduleboundariesshouldnotbereorganizedadhoc.
4.Everythingis plainJavaScript —noTypeScript,no .ts/.tsxfilesanywhereinthisproject.
1.1 DesignReferenceFiles
Theteamhasdesignreferencesin .htmlformatforscreenlayout/visualstyling. Atthetimeof
writingthisdocument,no .htmldesignfileswereattachedtothisconversation—onlythePDF
problemstatementandanExcalidrawmockuplink( https://app.excalidraw.com/l/65VNwvy7c4X/5ywnm0v3qhK )
wereprovided.
Action required before/during frontend implementation: upload the .htmldesign files.
Onceavailable,Antigravityshould: -Extractthecolorpalette,spacing,typography,andcompo-
nentlayoutfromeach .htmlfile. -Mapeach .htmlfiletothecorrespondingReactpagelistedin
SectionE(e.g. dashboard.html →src/features/dashboard/pages/DashboardPage.jsx ). -Reuse
theHTML’smarkupstructureandclassnamesasthestartingpointfortheJSX+Tailwindim-
plementation,ratherthanredesigningfromscratch,sothedeliveredappvisuallymatchesthe
approveddesignexactly. -Ifany .htmlfileconflictswiththeUI/UXdirectioninSectionH,the
.htmlfilewins—itrepresentstheteam’sactualapproveddesign.
4
2 1. TechStack—MERN,JavaScriptOnly
Layer Technology Notes
Database MongoDB(MongooseODM) Documentmodelfits
procurement’snesteddata
(RFQitemlists,quotation
snapshots)well;Mongoose
givesschemavalidation+
middlewarewithoutaquery
languagetolearn
Backend Node.js+Express.js PlainJavaScript(CommonJS
orESModules—thisdocuses
ESModules import/export ),
noTypeScript
Frontend React18+Vite PlainJavaScript, .jsxfiles,no
TypeScript
Styling TailwindCSS Utility-first,fasttobuilda
consistentdesignsystem
Frontenddata/state ReactQuery (serverstate)+
Zustand(client/UIstate)Querygivesbuilt-in
loading/error/cache;Zustand
forauth/sessionandsmallUI
flags
Routing ReactRouterv6 Protected+role-gatedroutes
Forms ReactHookForm +YupYupinsteadofZod(Zodis
TS-oriented;Yupisthe
standardJS-firstvalidation
library)
Backendvalidation Joi(orYup—pickone,this
docusesJoisinceit’sthe
mostcommon
Express-ecosystemchoice)Validateseveryrequest
body/query/paramsbeforeit
reachesacontroller
Auth JWT(jsonwebtoken )+
bcryptjsAccess+refreshtokenpair
Fileuploads Multer(diskstorageunder
/uploads)RFQattachments
PDFgeneration PDFKit Invoice/POPDFgeneration,
streamedtoclient
Email Nodemailer Invoiceemailsending
Charts Recharts Dashboard+reports
HTTPclient(frontend) Axios Centralizedinstancewith
interceptors
Dev/test Nodemon,dotenv,ESLint+
PrettierStandardJStooling,nobuild
stepforbackend
ThisisamonorepowithtwoindependentlyrunnableJavaScriptapps: /backend(Express+Mon-
goDB)and /frontend(React+Vite). Nosharedcodebetweenthem—thecontractinSection5
istheonlythingthatcouplesthem.
5
3 2. ProductArchitecture
VendorBridge is a role-driven state machine wrapped in CRUD screens. The entire product
exists to move one procurement request through a fixed sequence of states, where each role
ownsoneortwotransitions:
RFQ(draft) -> RFQ(published) -> Quotation(submitted, by N vendors)
-> Quotation(selected) -> Approval(pending)
-> Approval(approved | rejected)
-> PurchaseOrder(issued) -> Invoice(generated) -> Invoice(sent | paid)
Everythingelse—dashboard,notifications,activitylog,analytics—isa read/reportinglayer
overthisonepipeline,notaseparatefeaturetobuildfromscratch. Buildthepipelinecorrectly
once;dashboardsandreportsbecomederivedqueries.
Systemshape: oneExpressRESTAPI,oneMongoDBdatabase,oneReactSPA.
•Thefrontendnevercomputesbusinessrules(e.g.“isthisquotationstilleditable?”,“isthis
thelowestprice?”). Thebackendcomputesandreturnstheseasflagsintheresponse. The
frontendonlyrenderswhatit’sgiven.
•Every state transition (RFQ published, quotation submitted, quotation selected, approval
decided,POissued,invoicegenerated/sent)writesone ActivityLog documentandfansout
Notification documents,centralizedinonebackendservice( activityLogger.service.js )
—neverduplicatedperroute.
6
4 3. UserJourneys
4.1 ProcurementOfficer
1.Logsin->Dashboard(pendingapprovals,activeRFQs,recentPOs/invoices,spendstats).
2.CreatesRFQ->title,item/servicelist,quantity,deadline,attachesspecfile->assigns2-4
vendors->publishes.
3.WatchesRFQdetailpagefillinasvendorsrespond(“2of4vendorsresponded”).
4.OpensComparison screen->sortsbyprice/delivery/rating->selectsawinningquotation.
5.Selectingaquotationauto-createsan ApprovalrequestroutedtoaManager.
6.Once approved, generates a Purchase Order in one click (pre-filled from the approved
quotation).
7.Generatesthe InvoicefromthePO->previews->downloadsPDF/prints/emailstothe
vendor.
8.DashboardandReportsreflectthecompletedcycleimmediately.
4.2 Vendor
1.Logsin->DashboardshowsRFQsassignedtothem(awaitingresponse/submitted/won/
lost).
2.OpensanRFQ->readsspec+deadline->submitsaQuotation(unitprice,total,delivery
timeline,notes).
3.CaneditthequotationuntiltheRFQdeadline anduntiltheOfficerselectsawinner(backend-
gated).
4.Afterselection: sees“Awardedtoanothervendor,”or,iftheywon,seesthePOonceissued.
5.Views/downloadsPOsandinvoicesaddressedtothem.
4.3 Manager/Approver
1.Logsin->Dashboard’sprimarywidgetis PendingApprovals .
2.Opensanapprovalrequest->seesRFQcontext,theselectedquotation,andhowitcompared
againstalternatives(notdecidingblind).
3.Approvesorrejects;remarkismandatoryonrejection,optionalonapproval.
4.Decisioninstantlyunblocks(orhalts)POgenerationandiswrittentotheaudittrail.
4.4 Admin
1.Logs in -> admin-scoped dashboard: user management, vendor directory oversight, org-
wideanalytics.
2.Managesuseraccounts(create/deactivate/reassignrole).
3.Manages/verifiesvendorrecords(activatesnewlyself-registeredvendors,deactivatesnon-
compliantones).
4.ViewsthesameReports&AnalyticsastheOfficer,butorg-wide,withexport.
7
5 4. DataModel(MongoDB/Mongoose)
DocumentsuseMongoDB’snative _id(ObjectId).Relationshipsaremodeledwith ObjectIdrefer-
ences( ref),populatedviaMongoose .populate() wheretheAPIcontractrequiresnesteddata.
5.1 4.1Collections&Schemas
5.1.1 User
{
_id:ObjectId ,
name :String , // required
email :String , // required, unique, lowercase
passwordHash :String , // required, bcrypt hash
role :String , // enum: PROCUREMENT_OFFICER | VENDOR | MANAGER | ADMIN
vendorId :ObjectId , // ref: 'Vendor', only set if role === VENDOR
isActive :Boolean , // default true
createdAt :Date ,
updatedAt :Date
}
5.1.2 Vendor
{
_id:ObjectId ,
companyName :String , // required
gstNumber :String , // required, unique, 15-char GSTIN format
category :String , // e.g. "Electronics", "Office Supplies", "Raw Materials"
contactName :String ,
contactEmail :String , // required
contactPhone :String , // required
address :String ,
status :String , // enum: PENDING | ACTIVE | INACTIVE, default PENDING
rating :Number , // 0-5, default 0, manually set for MVP
createdAt :Date ,
updatedAt :Date
}
5.1.3 Rfq
{
_id:ObjectId ,
rfqNumber :String , // unique, auto-generated e.g. "RFQ-2026-0001"
title :String , // required
description :String ,
itemDetails :[
{name :String ,quantity :Number ,unit :String ,specification :String }
],
deadline :Date , // required
status :String , // enum: DRAFT | PUBLISHED | CLOSED | AWARDED | CANCELLED
assignedVendors :[ObjectId] , // ref: 'Vendor'
attachments :[
{fileName :String ,filePath :String ,fileSize :Number ,uploadedAt :Date }
],
createdBy :ObjectId , // ref: 'User'
createdAt :Date ,
8
updatedAt :Date
}
5.1.4 Quotation
{
_id:ObjectId ,
rfqId :ObjectId , // ref: 'Rfq', required
vendorId :ObjectId , // ref: 'Vendor', required
unitPrice :Number , // required, > 0
quantity :Number , // required, > 0 (copied from RFQ at submit time)
totalAmount :Number , // computed: unitPrice * quantity
deliveryDays :Number , // required, > 0
notes :String ,
status :String , // enum: SUBMITTED | SELECTED | REJECTED | WITHDRAWN
submittedAt :Date ,
updatedAt :Date
}
// Compound unique index: { rfqId: 1, vendorId: 1 } — one active quotation per vendor per RFQ
5.1.5 Approval
{
_id:ObjectId ,
quotationId :ObjectId , // ref: 'Quotation', unique
rfqId :ObjectId , // ref: 'Rfq' (denormalized for fast lookups)
requestedBy :ObjectId , // ref: 'User' (the Procurement Officer)
approverId :ObjectId , // ref: 'User', nullable until decided
status :String , // enum: PENDING | APPROVED | REJECTED
remarks :String ,
decidedAt :Date ,
createdAt :Date
}
5.1.6 PurchaseOrder
{
_id:ObjectId ,
poNumber :String , // unique, auto-generated e.g. "PO-2026-0001"
quotationId :ObjectId , // ref: 'Quotation', unique
approvalId :ObjectId , // ref: 'Approval'
rfqId :ObjectId , // denormalized
vendorId :ObjectId , // denormalized
issuedBy :ObjectId , // ref: 'User'
status :String , // enum: ISSUED | ACKNOWLEDGED | COMPLETED | CANCELLED
totalAmount :Number ,
createdAt :Date
}
5.1.7 Invoice
{
_id:ObjectId ,
invoiceNumber :String , // unique, auto-generated e.g. "INV-2026-0001"
purchaseOrderId :ObjectId , // ref: 'PurchaseOrder', unique
9
vendorId :ObjectId , // denormalized
subtotal :Number ,
taxRate :Number , // percentage, e.g. 18 for 18% GST
taxAmount :Number , // computed
totalAmount :Number , // computed
status :String , // enum: GENERATED | SENT | PAID
pdfPath :String ,
sentAt :Date ,
createdAt :Date
}
5.1.8 ActivityLog
{
_id:ObjectId ,
entityType :String , // enum: RFQ | QUOTATION | APPROVAL | PO | INVOICE | VENDOR | USER
entityId :ObjectId ,
action :String , // e.g. "RFQ_PUBLISHED", "QUOTATION_SUBMITTED"
actorId :ObjectId , // ref: 'User'
metadata :Object , // free-form extra context
createdAt :Date
}
5.1.9 Notification
{
_id:ObjectId ,
userId :ObjectId , // ref: 'User', recipient
type :String ,
title :String ,
message :String ,
relatedEntityType :String ,
relatedEntityId :ObjectId ,
isRead :Boolean , // default false
createdAt :Date
}
5.2 4.2RelationshipDiagram
User 1---1 Vendor (only when role = VENDOR)
User 1---N Rfq (createdBy)
Rfq N---N Vendor (assignedVendors array)
Rfq 1---N Quotation
Vendor 1---N Quotation
Quotation 1---1 Approval
Approval 1---1 PurchaseOrder
PurchaseOrder 1---1 Invoice
User 1---N ActivityLog (actorId)
User 1---N Notification (userId)
TheQuotation->Approval->PurchaseOrder->Invoicechainisastrict 1:1 linear chain on
purpose—itmatchesthemandatedworkflowexactlyandkeepsevery“showmethefulllifecycle
ofRFQX”queryasimplechainoflookups,notabranchingtree.
10
6 5. APIContract(Full,withPayloadSamples)
6.1 5.1Conventions
BaseURL: /api/v1
Successenvelope:
{
"success" :true ,
"data" :{},
"meta" :{}
}
metaispresentonlyonpaginatedlistendpoints.
Errorenvelope:
{
"success" :false ,
"error" :{
"code" :"VALIDATION_ERROR" ,
"message" :"Human-readable summary" ,
"details" :[
{"field" :"email" ,"message" :"Invalid email format" }
]
}
}
Errorcodes->HTTPstatus:
Code Status
VALIDATION_ERROR 400
UNAUTHORIZED 401
FORBIDDEN 403
NOT_FOUND 404
CONFLICT 409
INTERNAL_ERROR 500
IDs:MongoDB ObjectId strings (24-char hex) everywhere, e.g. "64f1a2b3c4d5e6f7a8b9c0d1" .
Human-facing numbers ( rfqNumber,poNumber,invoiceNumber ) are separate auto-generated
strings.
Dates:ISO8601UTConthewire,e.g. "2026-08-20T10:30:00.000Z" . Frontendformatsfordis-
playonly.
Pagination: queryparams page(default 1),limit(default 20,max 100). Response meta:
{"page" :1,"limit" :20,"total" :57,"totalPages" :3}
Filtering:queryparamsnamedafterthefield,e.g. ?status=PUBLISHED&category=Electronics .
Sorting: ?sortBy=createdAt&sortOrder=desc — default is createdAt desc everywhere unless
stated.
Authheader: Authorization: Bearer <accessToken> requiredoneveryprotectedroute.
11
6.2 5.2Auth— /api/v1/auth
6.2.1 POST /auth/signup
Access:Public. Createsa VENDOR-role User+aVendordocument( status: "PENDING" ).
Requestbody:
{
"companyName" :"Shree Balaji Traders" ,
"gstNumber" :"24ABCDE1234F1Z5" ,
"category" :"Office Supplies" ,
"contactName" :"Rakesh Patel" ,
"email" :"rakesh@shreebalaji.co.in" ,
"phone" :"+919824012345" ,
"password" :"SecurePass@123"
}
Response 201:
{
"success" :true ,
"data" :{
"user" :{
"id" :"64f1a2b3c4d5e6f7a8b9c0d1" ,
"name" :"Rakesh Patel" ,
"email" :"rakesh@shreebalaji.co.in" ,
"role" :"VENDOR"
},
"vendor" :{
"id" :"64f1a2b3c4d5e6f7a8b9c0d2" ,
"companyName" :"Shree Balaji Traders" ,
"status" :"PENDING"
}
}
}
Errors: 400 VALIDATION_ERROR (bademail/GSTformat,weakpassword), 409 CONFLICT (emailor
GSTalreadyexists).
6.2.2 POST /auth/login
Access:Public.
Requestbody:
{"email" :"officer@vendorbridge.com" ,"password" :"SecurePass@123" }
Response 200:
{
"success" :true ,
"data" :{
"accessToken" :"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." ,
"user" :{
"id" :"64f1a2b3c4d5e6f7a8b9c0d1" ,
"name" :"Anita Sharma" ,
"email" :"officer@vendorbridge.com" ,
"role" :"PROCUREMENT_OFFICER" ,
12
"vendorId" :null
}
}
}
Arefreshtokenisalsosetasan httpOnlycookie (refreshToken ,7-dayexpiry)—notpresentin
theJSONbody.
Errors: 400 VALIDATION_ERROR ,401 UNAUTHORIZED (badcredentialsor isActive: false ).
6.2.3 POST /auth/refresh
Access:Public,requiresvalid refreshToken cookie.Requestbody: none.Response 200:new
{ accessToken } ,rotatestherefreshcookie. Errors: 401 UNAUTHORIZED (missing/expired/invalid
cookie).
6.2.4 POST /auth/logout
Access:Authenticated,anyrole.Clearstherefreshcookie. Response 200:{ "success": true,
"data": null }
6.2.5 POST /auth/forgot-password
Access:Public.Requestbody: { "email": "vendor@example.com" } Response 200(always,to
avoiduserenumeration):
{"success" :true ,"data" :{"message" :"If that email exists, a reset link has been sent." }}
6.2.6 POST /auth/reset-password
Access:Public.Requestbody:
{"token" :"a1b2c3d4-reset-token" ,"newPassword" :"NewSecurePass@456" }
Response 200:{ "success": true, "data": { "message": "Password reset successfully." }
}Errors: 400 VALIDATION_ERROR (weakpassword), 401 UNAUTHORIZED (bad/expiredtoken).
6.2.7 GET /auth/me
Access:Authenticated,anyrole. Response 200:currentuser’sprofileobject(sameshapeas
theloginresponse’s user).
6.3 5.3Users(Admin)— /api/v1/users
Access: ADMINonly.
13
6.3.1 GET /users
Query: ?role=&isActive=&page=&limit=&sortBy=&sortOrder= Response 200:
{
"success" :true ,
"data" :[
{"id" :"64f1..." ,"name" :"Anita Sharma" ,"email" :"officer@vendorbridge.com" ,"role" :"PROCUREMENT_OFFICER" ,"isActive" :true ,"createdAt" :"2026-06-01T09:00:00.000Z" }
],
"meta" :{"page" :1,"limit" :20,"total" :12,"totalPages" :1}
}
6.3.2 GET /users/:id ->200single Userobject,or 404 NOT_FOUND .
6.3.3 POST /users
Createsastaffaccount(Officer/Manager/Admin). Requestbody:
{"name" :"Vikram Rao" ,"email" :"vikram.rao@vendorbridge.com" ,"password" :"TempPass@789" ,"role" :"MANAGER" }
Response 201:created Userobject(without passwordHash ).
6.3.4 PATCH /users/:id
Requestbody(anysubset):
{"isActive" :false }
Response 200:updated User.404 NOT_FOUND /409 CONFLICT asapplicable.
6.4 5.4Vendors— /api/v1/vendors
Access:Read -> Officer, Manager, Admin (all vendors), Vendor (own record only). Write ->
Admin(status),Admin/Officer(createonbehalf),Vendor(ownprofilefields).
6.4.1 GET /vendors
Query: ?status=&category=&search=&page=&limit=&sortBy=&sortOrder= (searchmatches com-
panyNameorcontactEmail )Response 200:
{
"success" :true ,
"data" :[
{
"id" :"64f1a2b3c4d5e6f7a8b9c0d2" ,
"companyName" :"Shree Balaji Traders" ,
"gstNumber" :"24ABCDE1234F1Z5" ,
"category" :"Office Supplies" ,
"status" :"ACTIVE" ,
"rating" :4.2,
"contactEmail" :"rakesh@shreebalaji.co.in" ,
"contactPhone" :"+919824012345"
}
],
"meta" :{"page" :1,"limit" :20,"total" :34,"totalPages" :2}
}
14
6.4.2 GET /vendors/:id
Response 200:fullVendorobjectpluscomputedfields:
{
"success" :true ,
"data" :{
"id" :"64f1a2b3c4d5e6f7a8b9c0d2" ,
"companyName" :"Shree Balaji Traders" ,
"gstNumber" :"24ABCDE1234F1Z5" ,
"category" :"Office Supplies" ,
"contactName" :"Rakesh Patel" ,
"contactEmail" :"rakesh@shreebalaji.co.in" ,
"contactPhone" :"+919824012345" ,
"address" :"B-12, GIDC Industrial Estate, Surat, Gujarat" ,
"status" :"ACTIVE" ,
"rating" :4.2,
"totalRfqsInvited" :18,
"totalQuotationsWon" :6,
"createdAt" :"2026-01-15T08:00:00.000Z"
}
}
404 NOT_FOUND ifmissing.
6.4.3 POST /vendors
Access:Admin,Officer. Requestbody:
{
"companyName" :"Nova Electronics Pvt Ltd" ,
"gstNumber" :"27PQRSX5678L1Z9" ,
"category" :"Electronics" ,
"contactName" :"Sunita Deshmukh" ,
"contactEmail" :"sunita@novaelectronics.in" ,
"contactPhone" :"+919876543210" ,
"address" :"Plot 45, MIDC, Pune, Maharashtra"
}
Response 201:created Vendor(status: "PENDING" bydefaultwhencreatedbyOfficer, "ACTIVE"
when created by Admin). Errors: 400 VALIDATION_ERROR (invalid GSTIN format — 15 chars,
standardGSTINregex), 409 CONFLICT (duplicateGST).
6.4.4 PATCH /vendors/:id
Access:Admin(anyfield),Vendor(own contactName /contactEmail /contactPhone /addressonly—
enforcedserver-side). Requestbody(subset):
{"contactPhone" :"+919824099999" }
Response 200:updated Vendor.403 FORBIDDEN ifaVendoreditssomeoneelse’srecord.
6.4.5 PATCH /vendors/:id/status
Access:Adminonly. Requestbody:
{"status" :"ACTIVE" }
Response 200:updated Vendor. Triggersa Notification tothevendor’suseraccount.
15
6.5 5.5RFQs— /api/v1/rfqs
Access:Create/manage->Officer,Admin.Read->Officer/Admin(all),Manager(all,read-only),
Vendor(onlyRFQswheretheir vendorIdisin assignedVendors —backendauto-scopesregardless
offilterspassed).
6.5.1 GET /rfqs
Query: ?status=&createdBy=&page=&limit=&sortBy=&sortOrder= Response 200:
{
"success" :true ,
"data" :[
{
"id" :"64f2a1b1c2d3e4f5a6b7c8d9" ,
"rfqNumber" :"RFQ-2026-0014" ,
"title" :"Procurement of Office Laptops (25 units)" ,
"status" :"PUBLISHED" ,
"deadline" :"2026-09-05T18:30:00.000Z" ,
"assignedVendorCount" :3,
"quotationCount" :2,
"createdAt" :"2026-08-18T07:12:00.000Z"
}
],
"meta" :{"page" :1,"limit" :20,"total" :41,"totalPages" :3}
}
6.5.2 GET /rfqs/:id
Response 200:
{
"success" :true ,
"data" :{
"id" :"64f2a1b1c2d3e4f5a6b7c8d9" ,
"rfqNumber" :"RFQ-2026-0014" ,
"title" :"Procurement of Office Laptops (25 units)" ,
"description" :"Business-grade laptops for the new Pune office setup." ,
"itemDetails" :[
{"name" :"Business Laptop, 16GB RAM, 512GB SSD" ,"quantity" :25,"unit" :"unit" ,"specification" :"Intel i5 12th Gen or equivalent, Windows 11 Pro" }
],
"deadline" :"2026-09-05T18:30:00.000Z" ,
"status" :"PUBLISHED" ,
"attachments" :[
{"fileName" :"laptop-spec-sheet.pdf" ,"filePath" :"/uploads/rfq/64f2.../laptop-spec-sheet.pdf" ,"fileSize" :245678 ,"uploadedAt" :"2026-08-18T07:12:30.000Z" }
],
"assignedVendors" :[
{"id" :"64f1a2b3c4d5e6f7a8b9c0d2" ,"companyName" :"Shree Balaji Traders" ,"responded" :true },
{"id" :"64f1a2b3c4d5e6f7a8b9c0d5" ,"companyName" :"Nova Electronics Pvt Ltd" ,"responded" :false }
],
"createdBy" :{"id" :"64f1a2b3c4d5e6f7a8b9c0d1" ,"name" :"Anita Sharma" },
"createdAt" :"2026-08-18T07:12:00.000Z"
}
}
16
403 FORBIDDEN ifaVendorrequestsanRFQtheyaren’tassignedto. 404 NOT_FOUND .
6.5.3 POST /rfqs
Access:Officer,Admin. Requestbody:
{
"title" :"Procurement of Office Laptops (25 units)" ,
"description" :"Business-grade laptops for the new Pune office setup." ,
"itemDetails" :[
{"name" :"Business Laptop, 16GB RAM, 512GB SSD" ,"quantity" :25,"unit" :"unit" ,"specification" :"Intel i5 12th Gen or equivalent, Windows 11 Pro" }
],
"deadline" :"2026-09-05T18:30:00.000Z" ,
"vendorIds" :["64f1a2b3c4d5e6f7a8b9c0d2" ,"64f1a2b3c4d5e6f7a8b9c0d5" ],
"publish" :true
}
publish: true createsdirectlyas PUBLISHED(andnotifiesvendors); publish: false (oromitted)
createsas DRAFT.Response 201:created Rfqobjectincludinggenerated rfqNumber.Errors: 400
VALIDATION_ERROR (empty itemDetails ,deadlineinthepast,fewerthan1 vendorIds).
6.5.4 PATCH /rfqs/:id
Access:Officer(ownRFQsonly), Admin. Editableonlywhile status === "DRAFT" .Request
body(subset):
{"title" :"Procurement of Office Laptops (30 units)" ,"deadline" :"2026-09-10T18:30:00.000Z" }
Response 200:updated Rfq.409 CONFLICT ifalreadypublished.
6.5.5 POST /rfqs/:id/publish
Access:Officer, Admin. Transitions DRAFT -> PUBLISHED , fans out Notification to assigned
vendors.Request body: none.Response 200:updated Rfq.409 CONFLICT if not currently
DRAFT.
6.5.6 POST /rfqs/:id/attachments
Access:Officer(own),Admin. multipart/form-data ,fieldname file.Response 201:
{"success" :true ,"data" :{"fileName" :"laptop-spec-sheet.pdf" ,"filePath" :"/uploads/rfq/64f2.../laptop-spec-sheet.pdf" ,"fileSize" :245678 ,"uploadedAt" :"2026-08-18T07:12:30.000Z" }}
6.5.7 POST /rfqs/:id/vendors
Addsvendorassignment(s)post-creation. Requestbody: { "vendorIds": ["64f1a2b3c4d5e6f7a8b9c0d9"]
}Response 200:updated Rfq.
6.5.8 POST /rfqs/:id/cancel
Access:Officer(own),Admin. Requestbody: { "reason": "Requirement withdrawn by finance
team." }Response 200:updated Rfq(status: "CANCELLED" ),notifiesassignedvendors.
6.6 5.6Quotations— /api/v1/rfqs/:rfqId/quotations and /api/v1/quotations
Access:Submit/edit->Vendor(onlyforRFQsthey’reassignedto,onlywhile RPUBLISHED,before
deadline,beforeawinnerisselected). Readall-for-RFQ->Officer/Admin/Manager.
17
6.6.1 GET /rfqs/:rfqId/quotations
Access:Officer, Admin, Manager. (Vendors get 403 FORBIDDEN — they use /quotations/mine
below.)Response 200:
{
"success" :true ,
"data" :[
{
"id" :"64f3b1c1d2e3f4a5b6c7d8e0" ,
"vendor" :{"id" :"64f1a2b3c4d5e6f7a8b9c0d2" ,"companyName" :"Shree Balaji Traders" ,"rating" :4.2 },
"unitPrice" :54500 ,
"quantity" :25,
"totalAmount" :1362500 ,
"deliveryDays" :12,
"notes" :"Includes 3-year onsite warranty." ,
"status" :"SUBMITTED" ,
"submittedAt" :"2026-08-19T11:00:00.000Z"
}
]
}
6.6.2 GET /quotations/mine?rfqId=64f2a1b1c2d3e4f5a6b7c8d9
Access:Vendor. Returnsthecaller’sownquotationforthatRFQ,or data: null(validempty
state,nota404)ifnotyetsubmitted.
6.6.3 POST /rfqs/:rfqId/quotations
Access:Vendor(mustbeintheRFQ’s assignedVendors ).Upserts—createsonfirstcall,updates
onsubsequentcallswhilestilleditable. Requestbody:
{"unitPrice" :54500 ,"deliveryDays" :12,"notes" :"Includes 3-year onsite warranty." }
(quantityis copied server-side from the RFQ’s itemDetails , not supplied by the client.) Re-
sponse 201(create) / 200(update):theQuotationobject.Errors: 403 FORBIDDEN (not as-
signed), 409 CONFLICT (deadlinepassed,RFQnot PUBLISHED,orawinneralreadyselected), 400
VALIDATION_ERROR (unitPrice <= 0 ,deliveryDays <= 0 ).
6.6.4 POST /quotations/:id/withdraw
Access:Vendor(ownquotationonly). Requestbody: none.Response 200:updated Quotation
(status: "WITHDRAWN" ).409 CONFLICT iftheRFQisalready AWARDED.
6.7 5.7Comparison&Selection— /api/v1/rfqs/:rfqId/comparison
Access:Read->Officer,Admin,Manager. Select(write)->Officer,Admin.
6.7.1 GET /rfqs/:rfqId/comparison
Response 200:
{
"success" :true ,
"data" :{
"rfq" :{"id" :"64f2a1b1c2d3e4f5a6b7c8d9" ,"rfqNumber" :"RFQ-2026-0014" ,"title" :"Procurement of Office Laptops (25 units)" ,"status" :"PUBLISHED" },
18
"quotations" :[
{
"id" :"64f3b1c1d2e3f4a5b6c7d8e0" ,
"vendor" :{"id" :"64f1a2b3c4d5e6f7a8b9c0d2" ,"companyName" :"Shree Balaji Traders" ,"rating" :4.2 },
"unitPrice" :54500 ,
"totalAmount" :1362500 ,
"deliveryDays" :12,
"notes" :"Includes 3-year onsite warranty." ,
"isLowestPrice" :true ,
"isFastestDelivery" :false
},
{
"id" :"64f3b1c1d2e3f4a5b6c7d8e5" ,
"vendor" :{"id" :"64f1a2b3c4d5e6f7a8b9c0d5" ,"companyName" :"Nova Electronics Pvt Ltd" ,"rating" :3.8 },
"unitPrice" :56200 ,
"totalAmount" :1405000 ,
"deliveryDays" :8,
"notes" :"Ships from Pune warehouse, faster turnaround." ,
"isLowestPrice" :false ,
"isFastestDelivery" :true
}
]
}
}
Allcomparisonflags( isLowestPrice ,isFastestDelivery )arecomputedserver-side.
6.7.2 POST /rfqs/:rfqId/select-quotation
Access:Officer, Admin. The pivot endpoint of the whole workflow. Request body: { "quo-
tationId": "64f3b1c1d2e3f4a5b6c7d8e0" } Setsthechosenquotation status: "SELECTED" ,all
siblingquotations status: "REJECTED" ,theRFQ status: "AWARDED" ,andauto-createsthe Ap-
provaldocument(status: "PENDING" ).Response 200:thecreated Approvalobject:
{
"success" :true ,
"data" :{
"id" :"64f4c1d1e2f3a4b5c6d7e8f1" ,
"quotationId" :"64f3b1c1d2e3f4a5b6c7d8e0" ,
"rfqId" :"64f2a1b1c2d3e4f5a6b7c8d9" ,
"requestedBy" :"64f1a2b3c4d5e6f7a8b9c0d1" ,
"status" :"PENDING" ,
"createdAt" :"2026-08-20T09:00:00.000Z"
}
}
Errors: 409 CONFLICT (RFQnotinaselectablestate,or quotationId doesn’tbelongtothisRFQ).
6.8 5.8Approvals— /api/v1/approvals
Access:Readqueue/decide->Manager,Admin. Readownrequeststatus->Officer(forRFQs
theycreated).
19
6.8.1 GET /approvals
Query: ?status=&page=&limit= Response 200:list of Approvalwith nested quotation+rfq
summary, metapagination.
6.8.2 GET /approvals/:id
Response 200:
{
"success" :true ,
"data" :{
"id" :"64f4c1d1e2f3a4b5c6d7e8f1" ,
"status" :"PENDING" ,
"rfq" :{"id" :"64f2a1b1c2d3e4f5a6b7c8d9" ,"rfqNumber" :"RFQ-2026-0014" ,"title" :"Procurement of Office Laptops (25 units)" },
"quotation" :{"id" :"64f3b1c1d2e3f4a5b6c7d8e0" ,"vendor" :{"companyName" :"Shree Balaji Traders" },"unitPrice" :54500 ,"totalAmount" :1362500 ,"deliveryDays" :12},
"alternativeQuotations" :[
{"vendor" :{"companyName" :"Nova Electronics Pvt Ltd" },"unitPrice" :56200 ,"totalAmount" :1405000 ,"deliveryDays" :8}
],
"requestedBy" :{"id" :"64f1a2b3c4d5e6f7a8b9c0d1" ,"name" :"Anita Sharma" },
"createdAt" :"2026-08-20T09:00:00.000Z"
}
}
404 NOT_FOUND .
6.8.3 POST /approvals/:id/decide
Access:Manager,Admin. Requestbody:
{"decision" :"APPROVED" ,"remarks" :"Pricing and warranty terms are acceptable." }
remarksisrequiredifdecision === "REJECTED" .Response 200:updated Approval.On APPROVED,
the quotation stays SELECTEDand becomes eligible for PO generation. On REJECTED, the RFQ
revertsto PUBLISHEDsotheOfficercanselectadifferentquotation. Errors: 409 CONFLICT (already
decided), 400 VALIDATION_ERROR (missingremarksonrejection).
6.9 5.9PurchaseOrders— /api/v1/purchase-orders
Access:Create->Officer,Admin(onlyfroman APPROVEDapproval).Read->Officer/Admin/Manager
(all),Vendor(ownonly).
6.9.1 GET /purchase-orders
Query: ?status=&vendorId=&page=&limit= (Vendorroleisauto-scopedtotheirownPOsregard-
lessof vendorIdpassed).Response 200:paginatedlist.
6.9.2 GET /purchase-orders/:id
Response 200:fullPOwithnested quotation/rfq/vendorsummary. 403 FORBIDDEN ifaVendor
requestsaPOthatisn’ttheirs.
6.9.3 POST /purchase-orders
Access:Officer,Admin. Requestbody:
{"approvalId" :"64f4c1d1e2f3a4b5c6d7e8f1" }
20
Response 201:
{
"success" :true ,
"data" :{
"id" :"64f5d1e1f2a3b4c5d6e7f8a2" ,
"poNumber" :"PO-2026-0009" ,
"quotationId" :"64f3b1c1d2e3f4a5b6c7d8e0" ,
"approvalId" :"64f4c1d1e2f3a4b5c6d7e8f1" ,
"vendorId" :"64f1a2b3c4d5e6f7a8b9c0d2" ,
"status" :"ISSUED" ,
"totalAmount" :1362500 ,
"createdAt" :"2026-08-20T09:15:00.000Z"
}
}
Errors: 409 CONFLICT (approval.status !== "APPROVED" ,oraPOalreadyexistsforit).
6.9.4 GET /purchase-orders/:id/pdf
StreamsthePOasaPDF. 200,Content-Type: application/pdf .
6.10 5.10Invoices— /api/v1/invoices
Access:Generate->Officer,Admin. Read->Officer/Admin/Manager(all),Vendor(ownonly).
6.10.1 GET /invoices
Query: ?status=&vendorId=&page=&limit= Response 200:paginatedlist.
6.10.2 GET /invoices/:id
Response 200:fullinvoicewithtaxbreakdown.
6.10.3 POST /invoices
Access:Officer,Admin. Requestbody:
{"purchaseOrderId" :"64f5d1e1f2a3b4c5d6e7f8a2" ,"taxRate" :18}
Response 201:
{
"success" :true ,
"data" :{
"id" :"64f6e1f1a2b3c4d5e6f7a8b3" ,
"invoiceNumber" :"INV-2026-0009" ,
"purchaseOrderId" :"64f5d1e1f2a3b4c5d6e7f8a2" ,
"vendorId" :"64f1a2b3c4d5e6f7a8b9c0d2" ,
"subtotal" :1362500 ,
"taxRate" :18,
"taxAmount" :245250 ,
"totalAmount" :1607750 ,
"status" :"GENERATED" ,
"createdAt" :"2026-08-20T09:20:00.000Z"
21
}
}
Errors: 409 CONFLICT (aninvoicealreadyexistsforthisPO).
6.10.4 GET /invoices/:id/pdf
StreamstheinvoicePDF. 200,Content-Type: application/pdf .
6.10.5 POST /invoices/:id/send-email
Access:Officer,Admin. Requestbody(optionaloverride):
{"toEmail" :"rakesh@shreebalaji.co.in" }
Defaults to the vendor’s contactEmail if omitted. Sends the PDF as an attachment via
email.service.js ,sets status: "SENT" ,sentAt.Response 200:updated Invoice.Errors: 502
(mappedto INTERNAL_ERROR )ifSMTPfails—thePDFremainsdownloadableasafallback.
6.10.6 PATCH /invoices/:id/status
Access:Officer,Admin. Requestbody: { "status": "PAID" } Response 200:updated Invoice.
6.11 5.11Notifications&Activity— /api/v1/notifications ,/api/v1/activity-
logs
6.11.1 GET /notifications
Access:anyauthenticatedrole,auto-scopedto req.user.id . Query: ?isRead=&page=&limit= .
6.11.2 PATCH /notifications/:id/read ->200,marksread.
6.11.3 PATCH /notifications/read-all ->200.
6.11.4 GET /activity-logs
Access:Officer,Manager,Admin.Query: ?entityType=&entityId=&page=&limit= (alwayssorted
createdAt desc ).Response 200:
{
"success" :true ,
"data" :[
{"id" :"64f7..." ,"entityType" :"RFQ" ,"entityId" :"64f2a1b1c2d3e4f5a6b7c8d9" ,"action" :"RFQ_PUBLISHED" ,"actor" :{"name" :"Anita Sharma" },"createdAt" :"2026-08-18T07:12:05.000Z" },
{"id" :"64f8..." ,"entityType" :"QUOTATION" ,"entityId" :"64f3b1c1d2e3f4a5b6c7d8e0" ,"action" :"QUOTATION_SUBMITTED" ,"actor" :{"name" :"Rakesh Patel" },"createdAt" :"2026-08-19T11:00:00.000Z" }
],
"meta" :{"page" :1,"limit" :20,"total" :9,"totalPages" :1}
}
6.12 5.12Reports&Analytics— /api/v1/reports
Access:Officer,Admin,Manager(read). NoVendoraccess.
22
6.12.1 GET /reports/dashboard-summary
Role-aware—returnsthewidgetsetrelevantto req.user.role .Response 200(Procurement
Officerexample):
{
"success" :true ,
"data" :{
"pendingApprovalsCount" :3,
"activeRfqsCount" :7,
"recentPurchaseOrders" :[{"poNumber" :"PO-2026-0009" ,"vendor" :"Shree Balaji Traders" ,"totalAmount" :1362500 }],
"recentInvoices" :[{"invoiceNumber" :"INV-2026-0009" ,"status" :"SENT" ,"totalAmount" :1607750 }],
"spendToDate" :8450000
}
}
6.12.2 GET /reports/vendor-performance
Response 200:
{
"success" :true ,
"data" :[
{"vendorId" :"64f1a2b3c4d5e6f7a8b9c0d2" ,"companyName" :"Shree Balaji Traders" ,"quotationsSubmitted" :14,"quotationsWon" :6,"winRate" :42.9 ,"avgDeliveryDays" :11,"rating" :4.2 }
]
}
6.12.3 GET /reports/spend-summary?from=2026-01-01&to=2026-08-20
Response 200:{ "totalSpend": ..., "spendByCategory": [...], "spendByVendor": [...] }
6.12.4 GET /reports/procurement-trends?months=6
Response 200:monthlyseriesofRFQscreated,POsissued,totalspend—feedsthetrendchart.
6.12.5 GET /reports/export?type=spend|vendor-performance&format=csv (optional-tier,
Section 9)
StreamsCSV, 200,Content-Type: text/csv .
23
7 6. BackendArchitecture(Node.js+Express+MongoDB,
PlainJavaScript)
7.1 6.1FolderStructure
backend/
src/
server.js # bootstraps http server, connects Mongo, starts listener
app.js # express app: middleware wiring, route mounting
config/
env.js # loads & validates .env vars (throws on startup if missing)
db.js # mongoose.connect() wrapper
middleware/
auth.middleware.js # verifies JWT, attaches req.user
role.middleware.js # requireRole(['MANAGER', 'ADMIN']) guard factory
validate.middleware.js # runs a Joi schema against req.body / req.query / req.params
error.middleware.js # central error handler -> standard error envelope
rateLimiter.middleware.js # express-rate-limit, applied to auth + write-
heavy routes
upload.middleware.js # multer config for RFQ attachments
modules/
auth/
auth.routes.js
auth.controller.js
auth.service.js # login/signup/forgot-password logic, token issuing
auth.schema.js # Joi request schemas
users/
users.routes.js
users.controller.js
users.service.js
users.schema.js
vendors/
vendors.routes.js
vendors.controller.js
vendors.service.js
vendors.schema.js
vendor.model.js # Mongoose model
rfq/
rfq.routes.js
rfq.controller.js
rfq.service.js
rfq.schema.js
rfq.model.js
quotations/
quotations.routes.js
quotations.controller.js
quotations.service.js
quotations.schema.js
quotation.model.js
comparison/
comparison.routes.js
comparison.controller.js
comparison.service.js # read-only aggregation + selection transition
approvals/
approvals.routes.js
24
approvals.controller.js
approvals.service.js
approvals.schema.js
approval.model.js
purchaseOrders/
purchaseOrders.routes.js
purchaseOrders.controller.js
purchaseOrders.service.js
purchaseOrder.model.js
invoices/
invoices.routes.js
invoices.controller.js
invoices.service.js
invoices.schema.js
invoice.model.js
notifications/
notifications.routes.js
notifications.controller.js
notifications.service.js
notification.model.js
activityLogs/
activityLogs.routes.js
activityLogs.controller.js
activityLog.model.js
reports/
reports.routes.js
reports.controller.js
reports.service.js # Mongo aggregation pipelines
user/
user.model.js # Mongoose model kept in users/ module
shared/
services/
activityLogger.service.js # single writer for ActivityLog + Notification fan-out
pdf.service.js # invoice/PO PDF generation (PDFKit)
email.service.js # nodemailer wrapper
numberGenerator.service.js # RFQ/PO/Invoice sequential number generation
utils/
apiResponse.js # success()/error() envelope helpers
asyncHandler.js # wraps async controllers to forward errors to error.middleware
pagination.js # parses page/limit/sortBy/sortOrder from req.query
seed/
seed.js # populates realistic demo data (Section 9)
data/ (vendors.json, users.json, rfqs.json)
uploads/
rfq/ # multer-saved attachments, served statically
invoices/ # generated invoice PDFs
.env.example
package.json
Each modules/<name> follows the same 4-file pattern ( routes -> controller -> service ->
schema, plus a model.jswhere the module owns a collection). Any two developers can work
onseparatemoduleswithouttouchingsharedfiles—importantwhensplittinghackathonwork
acrossateam.
25
7.2 6.2LayeredResponsibility
•Routes( *.routes.js ):onlywiring—path,middlewarechain( auth,role,validate),con-
trollermethodreference. Nologic.
•Controllers( *.controller.js ):parse req,calltheservice,shapetheresponsevia apiRe-
sponse.js. Nobusinesslogic,nodirectMongoosecalls.
•Services( *.service.js ):allbusinesslogicandMongoosequerieslivehere. Thisiswhere
state-transitionrulesareenforced(e.g.“aquotationcanonlybeeditedwhiletheparentRFQ
isPUBLISHED,beforeits deadline,andbeforeawinnerisselected”).
•Schemas ( *.schema.js ):Joi definitions for request validation, consumed by vali-
date.middleware.js .ThesemirrorSection5exactly—ifapayloadsampleinthisdocument
changes,theschemachangestoo,nottheotherwayaround.
•Models ( *.model.js):Mongooseschema+modeldefinitionsmatchingSection4exactly,
includingindexes(e.g.compounduniqueindexon Quotation { rfqId, vendorId } ).
7.3 6.3Cross-CuttingBackendRules
•Everyservicecallthatchangesatrackedentity’sstatusendswithacallto activityLog-
ger.service.js , which(a)writesan ActivityLog documentand(b)creates Notification
document(s)fortherelevantrecipients(e.g.quotationsubmitted->notifytheRFQ’s creat-
edBy;approvaldecided->notifytheProcurementOfficer). Thiskeepsnotificationlogicout
ofeveryindividualmodule.
•Sequentialhuman-facingnumbers( RFQ-2026-0001 ,PO-2026-0001 ,INV-2026-0001 )aregener-
atedinside numberGenerator.service.js usingadedicated Countercollectionwithanatomic
findOneAndUpdate({ $inc: { seq: 1 } }, { upsert: true }) toavoidraceconditionsunder
concurrentcreation—thisistheMongoDB-nativeequivalentofaDB-transaction-guarded
sequence.
•Allmonetaryvaluesarestoredasplain NumberinMongoDBbutalwayscomputed/roundedto
2decimalplacesserver-sidebeforebeingwrittenorreturned,tokeeptax/totalcalculations
consistent.
•app.jsmounts,inorder: helmet()(securityheaders)-> cors()(lockedtofrontendorigin)
->express.json() ->routemodules-> error.middleware.js (mustbemountedlast).
26
8 7. FrontendArchitecture(React+Vite,PlainJavaScript)
8.1 7.1FolderStructure
frontend/
src/
main.jsx # ReactDOM root render
App.jsx # top-level app shell
app/
router.jsx # route table, ProtectedRoute / RoleRoute wrappers
providers.jsx # QueryClientProvider, AuthProvider, ToastProvider
features/
auth/
pages/
LoginPage.jsx
SignupPage.jsx
ForgotPasswordPage.jsx
api.js # login(), signup(), forgotPassword() — axios calls
useAuthStore.js # Zustand store: user, accessToken, role
authSchema.js # Yup validation schemas for the forms
dashboard/
pages/DashboardPage.jsx
components/
PendingApprovalsCard.jsx
ActiveRfqsCard.jsx
RecentPOsCard.jsx
RecentInvoicesCard.jsx
StatsCard.jsx
QuickActions.jsx
api.js
hooks.js # useDashboardSummary() React Query hook
vendors/
pages/ (VendorListPage.jsx, VendorDetailPage.jsx, VendorFormPage.jsx)
components/ (VendorTable.jsx, VendorStatusBadge.jsx, VendorFilterBar.jsx)
api.js / hooks.js
rfq/
pages/ (RfqListPage.jsx, RfqCreatePage.jsx, RfqDetailPage.jsx)
components/ (RfqForm.jsx, RfqStatusBadge.jsx, VendorAssignPicker.jsx, AttachmentUploader.jsx)
api.js / hooks.js
quotations/
pages/ (QuotationSubmitPage.jsx, VendorQuotationsPage.jsx)
components/ (QuotationForm.jsx, QuotationCard.jsx)
api.js / hooks.js
comparison/
pages/ComparisonPage.jsx
components/ (ComparisonTable.jsx, LowestPriceHighlight.jsx, RatingIndicator.jsx)
api.js / hooks.js
approvals/
pages/ (ApprovalQueuePage.jsx, ApprovalDetailPage.jsx)
components/ (ApprovalTimeline.jsx, DecisionForm.jsx)
api.js / hooks.js
procurementDocs/ # PO + Invoice share a lot of UI
pages/ (PurchaseOrderPage.jsx, InvoicePage.jsx)
components/ (DocumentPreview.jsx, TaxBreakdownTable.jsx, EmailInvoiceModal.jsx)
api.js / hooks.js
notifications/
27
components/ (NotificationBell.jsx, NotificationList.jsx, ActivityTimeline.jsx)
api.js / hooks.js
reports/
pages/ReportsPage.jsx
components/ (SpendChart.jsx, VendorPerformanceChart.jsx, TrendChart.jsx, ExportButton.jsx)
api.js / hooks.js
admin/
pages/ (UserManagementPage.jsx, VendorApprovalPage.jsx)
api.js / hooks.js
components/ui/ # design-system primitives
Button.jsx
Input.jsx
Select.jsx
Table.jsx
Card.jsx
Badge.jsx
Modal.jsx
Toast.jsx
Skeleton.jsx
EmptyState.jsx
ErrorState.jsx
lib/
apiClient.js # single axios instance: base URL, auth header injection,
# 401 refresh-and-
retry interceptor, error envelope unwrapping
queryClient.js # React Query client config
formatters.js # date, currency (INR), status-label formatting
permissions.js # role -> allowed-actions map (UI-
only gating, mirrors backend)
designReference/ # <-- team's approved .html design files go here once provided;
# used as the visual/markup source of truth per Section 0
assets/
logo.svg
index.css # Tailwind directives + design tokens (CSS variables)
vite.config.js
tailwind.config.js
.env.example
package.json
8.2 7.2StateManagementStrategy
•Serverstate (anythingfromtheAPI—RFQs,quotations,vendors,POs…)-> ReactQuery
only. Everylist/detailviewisa useQuery;everymutationisa useMutation thatinvalidates
therelevantquerykeys. ThisiswhatgivesLoading/Success/Empty/Errorhandlingfor
freeacrosstheapp(Section10ofthebrief).
•Client/UI state (current modal open, selected comparison rows, sidebar collapsed, auth
user/token)-> Zustand,keptintentionallysmall.
•Forms->React Hook Form +Yupresolver;Yupschemascolocatedwitheachfeature’s
api.js(e.g. rfqSchema.js nextto rfq/api.js)sopayloadshapeandvalidationliveside-by-
side,andmatchSection5’srequest-bodysamplesexactly.
8.3 7.3APIIntegrationPattern
Single lib/apiClient.js wrapseverycall:
apiClient .get(url ,{ params }) .then (unwrapData) // returns response.data.data, or throws ApiError
28
ApiErrorcarries { code, message, details } straightfromthebackend’serrorenvelope, so
everyfeature’serrorUIcanjustrender error.message ormap error.details ontoformfields—
noper-featureparsingoftheenvelope.
8.4 7.4Routing&RoleGating
•ProtectedRoute checks isAuthenticated (valid accessToken intheZustandstore).
•RoleRoutechecks user.roleagainstan allowedRoles propandredirectstoa403pageoth-
erwise. Everyroutedeclaresitsallowedrolesrightnexttoitspathin router.jsx,sothe
wholeapp’saccessmapisreadableinonefile.
•ThisisaUXconvenienceonly—realenforcementhappensinbackendmiddleware(Section
8).
8.5 7.5DesignSystem
•Colors:neutral slate scale for chrome/backgrounds; a single indigo/blue primary for ac-
tions;semanticcolorsreservedforstatusonly—green(approved/paid/active),amber(pend-
ing/draft),red(rejected/overdue),slate(closed/cancelled). Nodecorativegradients.
•Typography: onefontfamily(Inter),4sizesforbody/label/heading/display,oneconsistent
line-heightscale.
•Spacing:4pxbaseunit,Tailwind’sdefaultscale,noarbitrarypixelvalues.
•Shared components built once, reused everywhere: <StatusBadge status="..."
/>maps every status enum in the system to a consistent color + label; <Table>han-
dles loading-skeleton rows, empty state, and pagination footer identically across Ven-
dors/RFQs/Quotations/POs/Invoiceslists.
•Every list/detail page composes the same three states: <Skeleton /> while loading,
<EmptyState /> whenthearrayisempty, <ErrorState onRetry={refetch} /> onaquery
error—implementedoncein components/ui ,notre-implementedperfeature.
•Oncethe .htmldesignreferencesareprovided(Section0),theexactpalette/spacing/typography
values here should be reconciled against them and this section updated to match the ap-
proveddesignprecisely.
29
9 8. Authentication&Authorization
•Passwordstorage: bcryptjs,saltrounds=12.
•Tokens:short-lived JWT access token (15 min) carrying { userId, role } , signed with
JWT_ACCESS_SECRET ; longer-lived refresh token (7 days), signed with JWT_REFRESH_SECRET ,
stored as an httpOnly, secure, sameSite=strict cookie . The access token is kept in
memory on the frontend (Zustand store, not localStorage ) to reduce XSS exposure; the
/auth/refresh endpointrotatesbothtokens.
•Signup:Procurement Officer / Manager / Admin accounts are created by an Admin (via
POST /users )orseeded. Public self-signup is exposed for the Vendor role only —a
vendorregistersvia POST /auth/signup ,creatinganaccount+ Vendorrecordwith status:
"PENDING"; an Admin then activates it via PATCH /vendors/:id/status . This mirrors real
procurementonboardingandgivesthedemoaclean“Adminapprovesanewvendor”beat.
•Everyprotectedroute runs auth.middleware.js (validtokenrequired),then role.middleware.js
(requireRole([...]) ) whererelevant. Ownershipcheckshappeninsidetheservicelayer
wheretherolealoneisn’tenough—e.g.aVendorcanonlysubmitaquotationagainstan
RFQtheywereactuallyassignedto,checkedagainsttheRFQ’s assignedVendors array,not
justtheirroleclaim.
•NoendpointtruststheJWTrolebeyondidentifyingwhoisasking. Everyauthorization
decisionthatdependsonarelationship(assignedvendor,RFQowner,designatedapprover)
isre-derivedserver-sidefromthedatabase,notinferredfromthetoken.
•CORS:lockedtothedeployedfrontendoriginonly, credentials: true toallowtherefresh
cookie.
•Rate limiting: stricter limits on POST /auth/login and POST /auth/forgot-password to
bluntbrute-force/enumerationattempts.
•Input validation: Joivalidateseveryrequestbody/query/paramsbeforeitreachesacon-
troller—thisdoublesasinjectionprotection(nothingmalformedreachesMongoose)along-
sideMongoose’sownparameterizedquerybuilding.
•Secrets: MONGODB_URI ,JWT_ACCESS_SECRET ,JWT_REFRESH_SECRET ,SMTPcredentialsalllive
inthebackend’s .envfile,nevercommitted( .envin.gitignore,.env.example committed
withplaceholdervalues),neversenttothefrontendbundle.
30
10 9. MVPvsOptionalFeatures
10.1 MVP(mustworkend-to-endforthedemo)
•Auth: login,signup(vendorself-signup+seededstaffaccounts),role-basedrouting.
•Dashboardwithrealwidgets(notplaceholders)perrole.
•Vendormanagement: list,create,view,status,category,search/filter.
•RFQ:create(itemdetails+deadline+attachment),assignvendors,publish,detailview.
•Quotation: vendorsubmit+edit-before-lock,officerviewsallquotationsperRFQ.
•Comparisonscreenwithlowest-pricehighlightandselectaction.
•Approval: requestauto-createdonselection,managerapprove/rejectwithremarks.
•PO:auto-generatedonapproval,POnumber,PDF/view.
•Invoice: generatedfromPO,tax+totalcalculation,PDFdownload,print, emailsend (real
SMTPcall,eventoatestinbox).
•Activitylog+notificationstiedtoeverytransitionabove.
•Basicanalytics:spendtotal,RFQcountbystatus,topvendorsbyawardcount—realcharts,
notmockups.
10.2 Optional/Nice-to-have(onlyafterMVPissolid)
•Fullemail-basedforgot-passwordflow(canstubas“resetlinkgenerated”inserverlogsfor
thedemo).
•Vendor performance rating auto-computed from delivery-timeliness history (start with a
manually-set ratingfield).
•ExportableCSVreports—astraightforwardadd-ononcetheReportsAPIexists.
•Multi-level/multi-approverapprovalchains—MVPissingle-approver.
•Filepreview(notjustdownload)forRFQattachments.
•Adminfine-grainedpermissioneditingbeyondthe4fixedroles.
•Real-time notification delivery (WebSocket/Socket.IO) — MVP can poll or refresh-on-
navigation,whichisinvisibleinalivedemo.
31
11 10. ImplementationPhases
Phase Scope Dependson
0. Foundation Reposcaffolding,Mongoose
models+indexes,seedscript
skeleton, apiRe-
sponse/error.middleware ,
Tailwinddesigntokens+UI
primitives–
1. Auth Signup/login/JWT/refresh,role
middleware,protected
routingonfrontendPhase0
2. Dashboardshell+layout Sidebar/nav,role-gatedroutes,
dashboardwidgetswiredto
(initiallystubbed)endpointsPhase1
3. Vendormanagement FullCRUD+list/filter/search,
vendorself-signup->admin
activationPhase1
4. RFQ Create/publish/detail,vendor
assignment,attachments
(Multer)Phase3(needsvendorsto
assign)
5. Quotations Vendorsubmission+edit,
officer’s“quotationsforthis
RFQ”viewPhase4
6. Comparison+Selection Aggregationendpoint,
comparisonUI,select-winner
actionPhase5
7. Approvals Auto-createdonselection,
managerqueue+decidePhase6
8. PurchaseOrders Auto-generateonapproval,
POdetail/PDF(PDFKit)Phase7
9. Invoices GeneratefromPO,tax/total
calc,PDF,print,email
(Nodemailer)Phase8
10. Notifications+Activity
LogCentralizedservicewired
retroactivelyintoeveryPhase
4-9transitionPhases4-9
11. Reports&Analytics Mongoaggregationpipelines
+charts,realdashboard
numbersreplacePhase2
stubsPhase9
12. Polish Loading/empty/errorstate
audit,responsivepass,seed
datarealismpass,security
review(ratelimits,headers,
CORS),reconcileUIagainst
.htmldesignreferencesAllabove
Eachphaseshouldendwiththerelevantsliceofthedemoflow(Section11)workingliveend-to-
end,notjustbuiltinisolation.
32
12 11. HackathonDemoStrategy(5-10min)
1.(0:00-0:30) OpenontheProcurementOfficerdashboardalreadyshowinglivenumbers—
setsthe“thisisarealrunningsystem”toneimmediately.
2.(0:30-2:00) CreateanRFQlive(mostlypre-filled,don’ttypeeverything),assign2seeded
vendors,publish.
3.(2:00-2:30) SwitchtoaVendoraccount(pre-logged-insecondbrowsertab)—showtheRFQ
appearing,submitaquotation. Switchtoasecondvendortab,submitadifferentquotation
—thisiswhatmakescomparisonmeaningful.
4.(2:30-3:30) Back to Officer: open Comparison, point out the lowest-price highlight and
deliverydifference,selectawinner.
5.(3:30-4:00) SwitchtoManagertab:approvalrequestalreadysittinginqueue,approvewith
aremark.
6.(4:00-4:30) BacktoOfficer: POauto-generated,oneclicktogenerateInvoice.
7.(4:30-5:30) ShowInvoicepreview->downloadPDF->(optionally)sendemaillive,showit
landinthetestinbox.
8.(5:30-6:00) JumptoActivityLog/Notificationstoshowthefulltrailwascapturedautomati-
cally,thenReportstoshowthedashboard/analyticsnumbersmovedbecauseofthetransac-
tionjustperformed.
9.Closebyresizingtoamobileviewportforonescreen(dashboardorcomparison)toprove
theresponsivenessclaimwithoutspendingdemotimeonit.
Keep 2-3 browser profiles/tabs pre-authenticated as each role before the demo starts — role-
switchingmid-demovialogout/loginwastestimeandrisksaglitchonstage.
33
13 12. Risks
Risk Area Mitigation
Scopecreepacross10screens
dilutesthecorepipelineScope Section9’sMVPlististhe
hardboundary;optional
featuresonlyafterPhase12
Frontend/backendpayload
driftIntegration Section5isfrozen;frontend
api.js/*Schema.jsfiles
hand-mappedfromit,not
inventedadhoc
PDFgenerationeating
disproportionatetimeTechnical UsePDFKitwithasimple
fixedlayout,notpixel-perfect
design;budgetasitsown
sub-taskinPhase9
Emailsendingfailinglive
duringdemo(network/SMTP)Demo UseareliabletestSMTP
(Ethereal/Mailtrap)verified
thedaybefore;fallbackto
showingthegeneratedPDFif
livesendfails
Raceconditionsonsequential
PO/Invoicenumbersifjudges
clickfastTechnical Numbergenerationviaatomic
findOneAndUpdate ona
Countercollection(Section
6.3)
Role-basedUIhiding
mistakenforrealsecuritySecurity Section8makesexplicit:
everyauthorizationdecisionis
re-checkedserver-side,not
justrole-gatedonthefrontend
Seeddatareadingasfake
(“TestVendor”,round
numbers)UX/Democredibility Seedscriptusesvaried
realisticIndiancompany
names/GSTINs,non-round
prices,staggeredhistorical
dates(Section6.3seedfolder)
Comparisonscreenbecoming
unreadablewithmany
vendorsUX Caprealisticseed/demo
scenarioat3-4vendorsper
RFQ;tabledesignedto
degradetohorizontalscroll
beyondthat,notbreaklayout
.htmldesignfilesnotyet
availableDesignfidelity FrontendUIprimitives
(Section7.5)arebuiltto
reasonabledefaultsnow;
Section0flagsexactlyhowto
reconcileoncefilesare
uploaded,sonoreworkof
componentstructureis
needed,onlystylingvalues
Twodevelopersimplementing
thesamemoduledifferentlyTeam/process Modulefolderpattern
(routes/controller/service/schema )
inSection6.1standardizes
structuresoanyteammate
canpredictfilelayout
34
14 AmendmentLog
(Add dated entries here if the frozen contract in Section 5 needs to change during implementation,
with a one-line reason.)
•v2.0— Switched stack to MERN (MongoDB, Express, React, Node), plain JavaScript
throughout(noTypeScript). Reviseddatamodelfromrelational(Prisma/Postgres)toMon-
goose/MongoDBdocuments. Revisedfrontendandbackendfolderstructuresaccordingly.
Added full request/response payload samples to every API endpoint. Added Section 0
covering .htmldesignreferencefileusage.
•v1.0—Initialproposal(MERN-adjacentstackoriginallyspecifiedasPostgres/Prisma/TypeScript)
—supersededbyv2.0.
35