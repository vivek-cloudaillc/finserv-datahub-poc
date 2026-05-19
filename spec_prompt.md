# Prompt: Infinize Financial Services Unified Data Hub — Production-Ready Spec + End-to-End Interactive Prototype

> Paste everything below the horizontal rule into Claude (or equivalent). Replace anything in `{{ curly braces }}` before running. The model should deliver **Part A (Spec)** in full first, then **Part B (Interactive Prototype)** as a single working React artifact. Both parts together describe a system you can hand to an engineering team and ship to production.

---

## Role

You are simultaneously a **principal solutions architect**, a **principal product designer**, and a **senior financial-services domain SME**. You have shipped enterprise data platforms across the full breadth of FinServ:

- **Banking** — JPMorgan Chase, Citi, Bank of America, Wells Fargo, US Bank, PNC, Truist, Capital One, Goldman (Marcus), HSBC, Barclays, Standard Chartered, DBS, ING.
- **Capital Markets & Asset Management** — BlackRock (Aladdin), State Street (Alpha), BNY Mellon, Northern Trust, Goldman Sachs (Marquee), Morgan Stanley, UBS, Citadel, Two Sigma, AQR, Bridgewater, Vanguard, Fidelity, T. Rowe Price, Invesco, PIMCO, Franklin Templeton, Schwab, Pershing, Apex Clearing.
- **Insurance & Reinsurance** — AIG, Allstate, Allianz, AXA, Chubb, The Hartford, Liberty Mutual, MetLife, Prudential, Nationwide, Progressive, State Farm, Travelers, Zurich, Munich Re, Swiss Re, SCOR, Hannover Re, Lloyd's of London; carriers running Guidewire, Duck Creek, Majesco, Insurity, Sapiens, EIS.
- **FinTech, BaaS, Payments** — Plaid, Stripe, Brex, Mercury, Ramp, Block, MX, Fiserv, FIS, Jack Henry, Galileo, Marqeta, Lithic, Unit, Treasury Prime, Modern Treasury, Column.
- **Wealth, Pensions, RIA** — Envestnet, Orion, Black Diamond, Tamarac, Addepar, Advent Geneva, SS&C, FIS Wealth, Charles River, Bloomberg AIM, Eagle Investment Systems, Empower, Fidelity Workplace.
- **Cloud & Data** — Snowflake Financial Services Data Cloud, Databricks Lakehouse for Financial Services, AWS FSI, Google Cloud FSI, Microsoft Cloud for FSI.

You have closed eight-figure deals with money-center banks, regional banks, community banks, credit unions, primary dealers, asset managers, hedge funds, insurance carriers, reinsurers, broker-dealers, payment processors, neobanks, BaaS providers, embedded-finance platforms, lenders, mortgage servicers, and wealth managers.

You can hold your own with a **Chief Risk Officer, Chief Data Officer, Chief Compliance Officer, BSA/AML Officer, CISO, Chief Actuary, Chief Investment Officer, Treasurer, Controller, Head of Capital Markets, Head of Insurance Underwriting, and a Big-Four auditor in the same room.** You speak the language of every persona who will read this document.

You know the following regulations cold and can recite both the spirit and the implementation cost of each:

- **US Banking** — Bank Secrecy Act, AML Act of 2020, GLBA, FCRA/FACTA, ECOA/Reg B, Reg E, Reg Z, Reg DD, Reg P, Reg CC, Reg W, Reg O, OFAC sanctions program, CRA, HMDA, TILA-RESPA Integrated Disclosures (TRID), Section 1071 small business lending data, CFPB Section 1033 open banking, Reg YY, Reg LL, Basel III/IV, CCAR/DFAST, IRR/IRRBB, Liquidity Coverage Ratio (LCR), Net Stable Funding Ratio (NSFR), FFIEC IT booklets (AIO, Information Security, Business Continuity, Cybersecurity Assessment Tool, Outsourcing), OCC Heightened Standards, OCC Bulletin 2013-29 / 2020-10 (third-party risk), SR 11-7 (model risk management), SR 15-18, SR 16-11, Reg SCI for SCI entities.
- **US Capital Markets** — SEC Reg NMS, Reg ATS, Reg SHO, Reg S-P, Reg S-ID, Reg SCI, Reg Best Interest, Rule 15c3-1 (net capital), Rule 15c3-3 (customer protection), Rule 15c3-5 (market access), Rule 17a-3/4 (books and records), Rule 17a-25, Rule 606, Rule 613 (Consolidated Audit Trail / CAT), FINRA TRACE, FINRA OATS (deprecated, replaced by CAT), MSRB EMMA/RTRS, CFTC Dodd-Frank Title VII, NFA, SWAP data reporting, T+1 settlement (effective May 28, 2024), Form PF, Form 13F, Form ADV, Investment Advisers Act 1940, Investment Company Act 1940.
- **Insurance** — NAIC Model Audit Rule (MAR), ORSA (Own Risk and Solvency Assessment), Risk-Based Capital (RBC), Statutory Accounting Principles (SAP), Insurance Data Security Model Law (NAIC #668), state DOI cybersecurity regulations (NYDFS Part 500 also applies), Holding Company Act, NAIC AML/CFT for insurers (life products), Affordable Care Act for health insurers, HIPAA (where PHI is processed), TRIA, ACA Section 6055/6056, IFRS 17, LDTI (Long-Duration Targeted Improvements / ASU 2018-12), Solvency II for European footprint.
- **Payments & Card** — PCI-DSS v4.0.1, Nacha Operating Rules, ISO 20022 (Fedwire migration completed March 10, 2025; CHIPS, RTP, FedNow), ISO 8583, EMV, Reg II (Durbin), Visa/Mastercard/Discover/Amex network rules, PayLater EU consumer rules.
- **Privacy & Cyber** — NYDFS 23 NYCRR 500 (amended 2023, full effect 2024-2025), GDPR, UK GDPR, CCPA/CPRA, CDPA, VCDPA, TDPSA, CTDPA, UCPA, OCPA, MTCDPA, INCDPA, DPDPA, MyHealthMyData (data brokers), state insurance cybersecurity laws (NAIC #668 adopted in 25+ states), DORA (EU Digital Operational Resilience Act, effective Jan 17, 2025), PSD2, PSD3/PSR (EU rulemaking 2024-2026), MiFID II/MiFIR, EMIR REFIT, SFTR, NIS2, CCPA/CPRA enforcement updates.
- **Cross-cutting** — SOX, SOC 1 Type II / SOC 2 Type II, ISO 27001/27017/27018/27701, NIST CSF 2.0, NIST SP 800-53, FedRAMP for any government work, AWS/Azure/GCP FSI compliance programs, CSA STAR.

You understand that **sponsor banks, custodians, prime brokers, reinsurers, and rating agencies all act as compliance gatekeepers**. You know which evidence packets each requires and at what cadence.

---

## Context — read carefully

I am Kishore Kristamsetty at **Infinize Technologies**. Infinize is expanding into the **broad Financial Services sector** with the **Infinize FinServ Unified Data Hub**. The story behind this build is simple and the same conversation happens with every prospect we meet — whether they are a regional bank, a global custodian, a P&C carrier, a wealth manager, an asset manager, a broker-dealer, a payments processor, a neobank, or a BaaS provider:

> "Our transaction data lives in our core (or trading platform, or policy admin system). Our customer data lives in our CRM. Our risk signals live in our risk engine. Our actuarial/credit/fraud models live in another stack. Our regulators want answers in 24 hours that take us 6 weeks to produce. We spent two years on a Snowflake/Databricks migration and we still cannot give the board a clean view of customer profitability, AML exposure, capital allocation, claims trends, or trade lifecycle. We have data in the lake; we do not have **trust** in the data."

Every regulator — the OCC, FDIC, Fed, SEC, FINRA, CFTC, NCUA, state DOIs, FinCEN, CFPB, the EU under DORA, the FCA, MAS, ASIC, RBI — is pushing the same direction: **integrated technology controls, real-time observability, data lineage to the source row, evidence-on-demand, AI/model governance under SR 11-7 (or equivalent), and operational resilience under DORA for any EU footprint.** Sponsor banks are now refusing to renew fintech contracts that cannot produce AML, sanctions, and CDD evidence on demand. Custodians are refusing to onboard managers without ISO-20022-clean post-trade flows. Reinsurers are tightening cession agreements that require IFRS-17-clean cedant data. Section 1033 open banking enforcement and CFPB rulemaking continues. T+1 is live; T+0 is being discussed.

**This is the buying moment for an integrated FinServ data hub.**

The spec and prototype you produce must:

1. **Sell the platform.** Every section answers "why Infinize, why now, why not build it ourselves or buy Snowflake-FSI / Databricks-FSI / MX / Plaid / Aladdin / Eagle / AxiomSL / OneSumX." Each section includes explicit talking points the AE can lift into a pitch.
2. **Be exhaustive on sources across all FinServ sub-sectors** — banking, capital markets, insurance, wealth, payments, lending. Do not hand-wave. Assume the prospect will throw every source they have at us.
3. **Show medallion architecture end-to-end.** Bronze → Silver → Gold (and an optional Platinum/online tier) with clear data contracts, SLAs, and ownership at each tier.
4. **Make data observability, quality, governance, and AI governance first-class features** — not afterthoughts. Regulators and sponsor banks lose deals on these, not on dashboards.
5. **Headline 360° insights with natural-language querying that is explainable to compliance, audit, and a federal examiner.** This is the demo moment. It must feel magical *and* survive scrutiny.
6. **Be regulation-complete** for US FinServ, with extensibility for EU (DORA, MiFID II/MiFIR, EMIR, PSD2/3, GDPR, Solvency II, IFRS 17), UK (PRA/FCA, UK GDPR), Canada (OSFI, PIPEDA), Singapore (MAS), and Australia (APRA, ASIC).
7. **Be production-ready.** Not a wireframe, not a vision deck, not a POC scope. Spec the entire system as if engineering will start building Monday.

## Your Deliverable — Two Parts, In Order

### PART A — Production-Ready Functional & Technical Specification (Markdown document)
A single, polished document handed to a prospect's CDO/CRO/CISO/CCO/CIO, forwarded to engineering, summarized on a slide. Target length **15,000–20,000 words**. Every section is decision-useful. Every section names a specific vendor, message standard, regulation, or table where a hand-wave would otherwise sneak in.

### PART B — Interactive React Prototype (single-file artifact)
A working, clickable prototype rendering **every functional screen** described in Part A, following the Infinize theme. Navigable from a persistent sidebar with realistic synthetic FinServ data spanning banking, capital markets, insurance, and wealth. No lorem ipsum. No backend calls. The prototype must demonstrate the platform's user value to a CDO, a CRO, a BSA Officer, a Chief Actuary, a Portfolio Manager, and an AE on the same demo.

Produce Part A in full, then produce Part B. Do not intermix.

---

## PART A — Specification Requirements

### 1. Executive Narrative (sales-ready)

- **One-paragraph hero statement** suitable for a deck cover slide. It must mention "trusted financial data fabric," "regulator-ready," and "AI-native" without sounding like buzzword soup.
- **The 7 problems** every FinServ data leader is living with right now:
  1. Data fragmentation across core/trading/policy/ledger/risk/CRM stacks
  2. Regulator pressure for evidence-on-demand (AML, sanctions, market-abuse, claims-leakage, solvency, fair-lending, BCBS 239)
  3. Section 1033, T+1 → T+0, ISO 20022, FedNow, DORA, IFRS 17, LDTI — all hitting at once
  4. AI/ML feature-store sprawl with no model-risk governance
  5. Cross-domain analytics impossible (banking customer who is also a wealth client and a policyholder)
  6. M&A integration debt — every acquisition leaves another copy of the customer master
  7. Sponsor-bank, custodian, reinsurer, and rating-agency due diligence cycles consuming engineering quarters
- **Infinize's differentiated POV in one page** — *the trusted financial data fabric, with built-in regulator-grade observability, governance, and AI guardrails, that unifies banking, capital markets, insurance, wealth, and payments in a single medallion lakehouse on the customer's cloud of choice.*
- **Battlecard-style comparison** in a table, vs.: **Snowflake FSI Data Cloud, Databricks Lakehouse for FSI, Microsoft Cloud for FSI, Google Cloud FSI, AWS FSI Data Lake reference, MX, Plaid (Enrich + Signal), Aladdin (BlackRock), Eagle Investment Systems (BNY), Charles River IMS, Bloomberg AIM, AxiomSL (now Adenza), Wolters Kluwer OneSumX, Moody's Regology, Collibra, Alation, Informatica IDMC, Fiserv Engage, FIS Code Connect, Treasury Prime, Unit, Galileo+Cyberbank, Guidewire DataHub & InfoCenter, Duck Creek Insights**. Columns: Strengths / Weaknesses / Where Infinize Wins / Where Infinize Concedes. Be honest about concessions — it sells better.
- **6 customer archetypes** with a 3-sentence success story each:
  1. Top-50 US regional bank ($80B AUM)
  2. Global custodian / asset servicer
  3. Mid-size P&C insurance carrier (Guidewire-on-AWS)
  4. RIA aggregator / wealth platform (Envestnet/Orion-adjacent)
  5. Scaling neobank with BaaS sponsor relationship
  6. Multi-line insurance group with reinsurance cessions and life/annuity LDTI exposure

### 2. Personas & Buying Committee

Minimum **12 personas**. For each: role, day-in-the-life pain, 3 objections, what makes them sign, and the single screen in the prototype that wins them.

- Chief Data Officer / Chief Analytics Officer
- Chief Risk Officer (enterprise risk)
- Chief Compliance Officer
- BSA / AML Officer
- Chief Information Security Officer
- Chief Actuary (insurance) / Head of Reserving
- Chief Investment Officer (asset management) / Head of Portfolio Construction
- Treasurer / Head of ALM
- Head of Capital Markets / Head of Trading Ops
- Head of Claims (insurance)
- VP of Product (cards, lending, payments, wealth platform, policy admin)
- Head of Internal Audit
- Data Engineer / Data Steward (end user)
- Regulatory Reporting Lead

### 3. Sub-Sector Coverage Matrix

Produce a table that, for each FinServ sub-sector, lists: **primary data domains, top 3 regulations, top 3 source systems, the Gold marts the Hub delivers, the killer demo for that sub-sector**.

Sub-sectors:
- Retail & Commercial Banking
- Cards & Payments
- Consumer Lending (incl. BNPL)
- Mortgage Origination & Servicing
- Commercial / SBA / CRE Lending
- Capital Markets Sell-Side (broker-dealer, market-maker)
- Capital Markets Buy-Side (asset manager, hedge fund, family office)
- Wealth Management & RIA
- Custody, Fund Administration, Transfer Agency
- Insurance — P&C (Personal & Commercial)
- Insurance — Life & Annuities (incl. LDTI)
- Insurance — Health (incl. PHI handling)
- Reinsurance & Retrocession
- Pensions & Retirement (DB, DC, 401(k), 403(b), NQDC)
- FinTech / Embedded Finance / BaaS
- Crypto & Digital Assets

### 4. Exhaustive Source Inventory

Organize as a table per sub-sector: `Category | Source/Vendor | Protocol/Format | Frequency | Sensitivity Tier | Ingestion Pattern | Bronze Landing Zone | Typical Volume @ Reference Customer`.

Must include, **at minimum**:

**Core Banking, Lending & Ledger**
- Core banking — Fiserv DNA, Fiserv Premier, Fiserv Cleartouch, Jack Henry SilverLake, Jack Henry Symitar, Jack Henry CIF 20/20, FIS Horizon, FIS IBS, FIS Profile, Finastra Phoenix, Finastra Fusion, Temenos T24 / Transact, Mambu, Thought Machine Vault, 10x Banking, Tuum, Avaloq, Capital Banking Solutions
- LOS (loans) — nCino, MeridianLink, Encompass (ICE), Blend, LendingPad, Mortgage Cadence, FIS LendingSpace, Finastra LaserPro, Calyx
- Servicing — Black Knight MSP / Empower / LoanSphere, Sagent, FICS, ICE Mortgage Tech, Mr. Cooper Xome, FIS Lending Solutions
- General ledger / ERP — Workday Financials, Oracle Fusion ERP, NetSuite, SAP S/4HANA, Microsoft D365 Finance, Sage Intacct
- Sub-ledgers (loans, deposits, cards, treasury, securities, derivatives)
- Trial balance, chart of accounts, settlement and reconciliation files

**Payment Rails & Processors**
- ACH (Nacha — PPD, CCD, WEB, TEL, CTX, IAT, ARC, BOC, POP, RCK, XCK), ACH same-day, ACH return / NOC handling
- Wire — Fedwire ISO 20022 (`pacs.008`, `pacs.009`, `camt.054`, `camt.056`, `camt.110`, `camt.111`); CHIPS (now ISO 20022); SWIFT MT 1xx-9xx and the MT→MX migration
- Real-time — FedNow (`pacs.008`, `pacs.002`, `pain.013`, `pain.014`), RTP/TCH (`pacs.008`, `pacs.002`), UPI (India), PIX (Brazil), SEPA Instant
- Card networks — Visa VisaNet (Base I/II, SMS), Mastercard MIP/Connect, Discover DNI, Amex GNS, ISO 8583 auth/clearing/settlement, BIN tables, interchange and assessment files
- Card processors — Marqeta, Galileo, Stripe Issuing, Lithic, Adyen Issuing, Fiserv (First Data), Pulse, Star
- Acquirers — Stripe, Adyen, Worldpay, Fiserv, Chase Paymentech, Elavon, Square, Global Payments
- Cross-border — SWIFT gpi, Wise Platform, Airwallex, Currencycloud, Nium, dLocal
- BNPL — Affirm, Klarna, Afterpay/Block, PayPal Pay Later, Zip, Sezzle
- Bill pay, RDC, P2P (Zelle via EWS)

**Open Banking, Aggregation & Identity**
- Plaid (Auth, Balance, Transactions, Identity, Income, Assets, Investments, Liabilities, Signal, IDV, Monitor)
- MX, Finicity (Mastercard), Akoya, Yodlee, TrueLayer (EU)
- CFPB Section 1033 outbound APIs (consumer-permissioned data) — FDX 6.x standard
- KYC/KYB — Persona, Alloy, Socure, Jumio, Onfido, Trulioo, Plaid IDV, Veriff, Middesk, Baselayer, Sayari, ComplyAdvantage KYB
- Government feeds — IRS TIN matching, SSA verification, USPS address validation, FinCEN BOI registry, BSA E-Filing, IRS 1098/1099/5498 e-file
- Beneficial ownership / UBO graphs

**AML, Sanctions, Fraud, Trust & Safety**
- OFAC SDN, OFAC Consolidated, OFAC Sectoral, OFAC 50% Rule advisories
- UN, EU, UK HMT, FATF high-risk, World Bank debarred, Interpol, Canada OSFI, Australia DFAT, Japan METI, Singapore MAS lists
- PEP & adverse media — Dow Jones Risk & Compliance, LexisNexis WorldCompliance, Refinitiv World-Check, ComplyAdvantage, Moody's Grid, RDC, Sayari, Quantexa
- Transaction monitoring — Verafin (Nasdaq), NICE Actimize (IFM, SAM, WLF), ComplyAdvantage, Sardine, Hummingbird, Unit21, Quantexa, Featurespace, ThetaRay, Napier
- Fraud — Sift, Sardine, SEON, Forter, Riskified, Kount (Equifax), Feedzai, BioCatch, NeuroID, Featurespace
- Consortium — Early Warning Services DDA, Visa Risk Manager / VAA, Mastercard Decision Intelligence, FICO Falcon
- Cyber threat intel — Recorded Future, Mandiant, CrowdStrike, FS-ISAC bulletins

**Credit Bureaus, Underwriting & Alternative Data**
- Experian, Equifax, TransUnion (consumer + commercial), Dun & Bradstreet, Cortera, PayNet
- VantageScore, FICO, FICO XD, UltraFICO
- Alternative data — LexisNexis RiskView, Clarity Services, FactorTrust, Nova Credit, Petal CashScore, Prism Data, Pinwheel, Argyle, Atomic
- Synthetic-identity / ID theft — SentiLink, Socure Sigma, Ekata
- Income/employment — Equifax Workforce Solutions (The Work Number), Pinwheel, Argyle, Atomic, Truv

**Capital Markets — Trading, OMS/EMS, Post-Trade**
- OMS / PMS — Charles River IMS, Bloomberg AIM, Eze (SS&C), Eagle Investment Systems, Advent Geneva, FactSet PMA, Indata iPM, BlackRock Aladdin, MSCI BarraOne
- EMS — Bloomberg EMSX, FlexTrade, Portware (FactSet), Virtu Triton, Liquidnet, ION Fidessa
- Order routing — FIX 4.2/4.4/5.0 SP2, FIXatdl, FAST
- Market data — Bloomberg B-PIPE, Refinitiv Real-Time, ICE Consolidated Feed, NYSE TAQ, Nasdaq TotalView, CME MDP 3.0, Tullett Prebon, BMLL historical
- Reference data — Bloomberg Open Symbology, FIGI, LEI (GLEIF), ISIN, CUSIP, SEDOL, RIC, MIC, MSCI, S&P Indices, FactSet
- Pricing & valuation — Bloomberg BVAL, ICE Data Services, Refinitiv DataScope, S&P Capital IQ, Markit (now S&P Global)
- Post-trade — DTCC CTM, ALERT, ITP/Omgeo, TradeSuite ID, FAST, NSCC, DTC, FICC, OCC; Euroclear, Clearstream, CDS Canada; SWIFT ISO 15022/20022 (`MT540-548`, `sese.023-024`)
- Repo/securities lending — DTCC Roll, EquiLend, Pirum, GLMX, Wematch
- Derivatives — DTCC GTR, ICE Trade Vault, CME Repository, LCH, ICE Clear, CME Clearing; FpML, ISDA CDM
- Corporate actions — Markit CAS (S&P Global), Bloomberg CACS, SWIFT seev messages, DTCC LENS
- Risk & analytics — MSCI BarraOne / RiskMetrics, Bloomberg PORT/MARS, Numerix, Calypso, Murex, FINCAD, RiskMetrics
- Treasury / TMS — Kyriba, GTreasury, FIS Quantum, Hazeltree, ION/Wallstreet Suite

**Wealth, Pensions & Asset Servicing**
- Custody — BNY Mellon, State Street, Northern Trust, JPM, Citi, Brown Brothers Harriman, Pershing, Schwab Custody, Fidelity Institutional, Apex Clearing, DriveWealth
- RIA / wealth platforms — Envestnet, Orion, Black Diamond, Tamarac, Addepar, eMoney, MoneyGuidePro, RightCapital, Wealthbox, Redtail
- Fund accounting — SS&C, Advent Geneva, Eagle (BNY), FIS InvestOne, Multifonds, Confluence
- Transfer agency — DST (SS&C), FIS, Computershare, Equiniti
- 401(k) / DC — Empower, Fidelity Workplace, Vanguard Institutional, Schwab Retirement, Human Interest, Guideline, T. Rowe Price, Principal
- DB & pension administration — Lynchval, Sagitec, Vitech, Milliman MARC
- Performance & attribution — FactSet PA, BlackRock Aladdin Performance, StatPro / Confluence, BNY Eagle PACE
- Digital assets — Coinbase Prime, Anchorage, BitGo, Fireblocks, Fidelity Digital Assets; on-chain analytics — Chainalysis, TRM Labs, Elliptic, Crystal

**Insurance — Policy, Claims, Underwriting**
- Policy admin — Guidewire PolicyCenter / BillingCenter / ClaimCenter, Duck Creek Policy/Billing/Claims, Majesco, Insurity, Sapiens, EIS, OneShield, Origami Risk
- Life & annuities admin — FAST (Verisk), wmA (FIS), Oracle Insbridge, LifeFlex (Sapiens), ALIS (Andesa), Vitech V3, Equisoft
- Reinsurance admin — Tai (Sapiens), SICS (msg global), Verisk reinsurance, R^X (Aon), Effisoft
- Underwriting workbench — Verisk LightSpeed, ISO ERC, RMS Risk Modeler / Intelligent Risk Platform, AIR Touchstone, KatRisk, Cape Analytics, Tractable, CoreLogic, Betterview, Zesty.ai, Arturo
- Claims — Snapsheet, Tractable, Mitchell, CCC ONE, Audatex, Solera, Xactware
- Subrogation, SIU — ISO ClaimSearch, NICB, Verisk
- Distribution — Vertafore (AMS360/Sagitta), Applied Epic, EZLynx, IVANS, Salesforce Insurance Cloud
- Quoting / rating — Hyland, Earnix, Akur8, Quadient, Salty, Bold Penguin
- Telematics & IoT — Cambridge Mobile Telematics, Octo, Verisk Telematics, Arity, IMS, smart-home / connected-car feeds
- ACORD standards — AL3, XML, GIS, P&C, Life & Annuity, Reinsurance & Large Commercial (RLC); ACORD ADEPT
- Reinsurance — Bordereaux (Lloyd's MRC), DA SATS, Whitespace, PPL, Atrium ATLAS
- Health — HL7 v2 / FHIR (where the insurer touches PHI), X12 EDI 834/835/837/270/271/278, NCPDP

**Customer, CRM, Service & Engagement**
- Salesforce Financial Services Cloud, Salesforce Insurance Cloud, Salesforce Service Cloud, HubSpot, Microsoft Dynamics 365 (Finance & Operations, Customer Insights)
- Contact center — Talkdesk, Five9, Genesys Cloud, NICE CXone, Amazon Connect, Cisco Webex Contact Center
- Conversational AI — Cresta, Observe.AI, Gong, Chorus
- Marketing automation — Iterable, Braze, Customer.io, Marketo, Adobe Experience Cloud, Salesforce Marketing Cloud
- Product analytics — Amplitude, Mixpanel, Heap, Pendo, Segment, RudderStack
- Mobile / web telemetry — Firebase, Adjust, AppsFlyer, Branch
- Knowledge / case mgmt — Hummingbird, ServiceNow FSO, Pega

**Operational, HR & Procurement**
- Workday HCM and Financials, BambooHR, Rippling, ADP, Ceridian Dayforce
- Procurement — Coupa, SAP Ariba, Ivalua
- Treasury / Ops — Modern Treasury, Increase, Column, Currency Cloud, Astra
- Existing data platforms (federated reads, not rebuild) — Snowflake, BigQuery, Redshift, Synapse, Databricks, Teradata, Netezza, Greenplum

**Regulatory & Reporting**
- FFIEC Call Reports (031/041/051), UBPR, FR Y-9C/SP/LP, FR Y-14 (CCAR), FR Y-15, FFIEC 002 (foreign branches), FFIEC 009 (country exposure)
- HMDA Loan Application Register (LAR), CRA, BSA SAR/CTR/Form 8300, FinCEN 314(a)/314(b), OFAC blocked/rejected reports, FBAR
- CFPB complaint data, CFPB supervisory feeds, Section 1071 small-business lending data
- IRS — 1099-INT, 1099-DIV, 1099-MISC, 1099-NEC, 1099-K, 1099-B, 1099-R, 1098, 1098-E, 5498, 5498-ESA, W-9, W-8 BEN/BEN-E, FATCA 8966, CRS XML
- State money-transmitter (NMLS, MSB Call Reports), surety bond reporting
- SEC filings — 10-K, 10-Q, 8-K, Form PF, Form 13F, Form ADV, Form CRS, Form N-PORT, Form N-CEN; XBRL/iXBRL
- FINRA — TRACE, CAT (Rule 613), Order Audit Trail (historic), Rule 4530, Form U4/U5
- MSRB EMMA / RTRS, MSRB G-32, G-34
- CFTC — Part 43/45/46 swap data reporting, Form CPO-PQR, Form CTA-PR
- Insurance — NAIC annual & quarterly statements (Yellow Book), Schedule D/E/F, RBC filings, ORSA Summary Report, SEC of state DOIs, MAR attestation
- IFRS 17 / LDTI cohort & assumption datasets
- EU — MiFID II/MiFIR transaction reporting (RTS 22), EMIR REFIT (ESMA), SFTR, CSDR, AIFMD Annex IV, FATCA/CRS, DORA register of information
- UK — PRA/FCA STDF, CASS, GABRIEL successor (RegData)
- Basel — BCBS 239 risk data aggregation principles

**Unstructured**
- Customer service call recordings & transcripts (with consent), CRM notes
- Email and secure-messaging archives (incl. WhatsApp/iMessage capture per SEC/FINRA recordkeeping rules — Smarsh, Global Relay, Symphony Compliance)
- Loan documents, policy documents, claim photos, drone & satellite imagery, OCR-ingested IDs
- Marketing assets, contracts, partner BAA-equivalents, ISDA/MRA/MSFTA agreements
- Trade voice & chat (Bloomberg IB, Symphony, Microsoft Teams capture)

For each source, call out: typical data volume at the reference customer, common pitfalls (e.g., Fiserv DNA EOD batch latency, ISO 8583 dialect drift across processors, ISO 20022 enhanced data being optional vs. mandatory in different message flows, Plaid item disconnects, ACH return windows R01–R85, FIX session sequencing, Guidewire ClaimCenter version skew, ACORD XML version drift, DTCC CTM message latency under load, BVAL/ICE pricing variance for thinly traded munis, options OCC settlement files arriving late on expiry Fridays), and **how the Hub handles each pitfall.**

### 5. Source Management

- **Source Catalog** — registry of every connected source with business owner, technical steward, refresh SLA, last-successful-run, schema version, sensitivity tier, regulator tag (e.g., "PCI", "MNPI", "PHI", "NPI", "MIFID-Reportable")
- **Connector SDK** — how partners and customers add new sources; templated YAML data contract with semver and breaking-change policy
- **Schema registry & drift detection** — Confluent-style, with breaking-change alerts (critical for ISO 20022 message versioning, ACORD version drift, FpML schema evolution, FHIR R4 ↔ R5 transitions)
- **Credential vault & rotation** — OAuth 2.0/2.1, OIDC, mTLS, SFTP keys, API keys, AWS IAM Roles Anywhere, HashiCorp Vault Transit, AWS Secrets Manager / Azure Key Vault / GCP Secret Manager; audit-friendly rotation logs for sponsor-bank, custodian, and DOI reviews
- **Source health score** — freshness + completeness + schema stability + reconciliation pass-rate, composite 0–100
- **Onboarding workflow** — 9-step wizard: Type → Sub-Sector → Protocol → Credentials → Schema Map → Sensitivity Classification → Quality Rules → Lineage Tags → Review & Approve

### 6. Ingestion Pipeline

- **Batch** — SFTP file drops from cores, custodians, and processors; S3 / GCS / ADLS drops; JDBC pull from Snowflake/BigQuery/Redshift/Synapse/Teradata; mainframe extracts (VSAM, IMS, DB2) via IBM CDC, Precisely Connect, BMC AMI Data
- **Micro-batch** — Kinesis Data Streams, Amazon MSK, Confluent Cloud, GCP Pub/Sub, Azure Event Hubs
- **Streaming** — ISO 20022 RTP/FedNow webhooks, ISO 8583 listeners, FIX engine consumers (e.g., QuickFIX/J, OnixS), corporate-action streams, market-data ticker plants
- **API pull** — Plaid, Persona, Marqeta, Stripe, Guidewire Cloud APIs, Salesforce Bulk API 2.0
- **Event-driven** — EventBridge, Stripe webhooks, Salesforce Platform Events, ServiceNow webhooks, Bloomberg DAPI, Refinitiv RDP
- **CDC** — Debezium, Oracle GoldenGate, AWS DMS, Striim, Qlik Replicate, IBM InfoSphere CDC
- **Mainframe** — for the big banks/carriers still on z/OS; respect EBCDIC, copybook drift, batch windows
- **Idempotent writes**, **exactly-once semantics for ledger, payment, trade-confirm, and policy-binding events**
- **Late-arriving data** — ACH returns (R01–R85), card chargebacks, trade breaks, policy endorsements backdated, claim reopens, corporate-action restatements
- **Replay & backfill framework** — critical for fixing missed AML scoring, missed market-abuse surveillance, restated IFRS-17 cohort calcs
- **Dead-letter queues** with triage UI and one-click reprocess
- **Rate limiting and backpressure** with per-source quotas
- **Pipeline-as-code** (declarative YAML) — show **5 full examples**:
  1. Fiserv DNA nightly EOD extract → Bronze
  2. ISO 20022 `pacs.008` FedNow stream → Bronze → Silver (sub-30-second SLA)
  3. ISO 8583 authorization tap from Marqeta → Bronze → real-time fraud scoring
  4. Guidewire ClaimCenter REST + JMS feed → Bronze (incl. ACORD XML parse)
  5. FIX 4.4 ExecutionReport stream from Charles River → Bronze → trade-blotter Silver

### 7. Transformation Layer

- **Parsing**: ISO 20022 XML → canonical payment model; ISO 8583 binary → canonical card model; Nacha → ACH canonical; SWIFT MT → MX uplift; FpML / ISDA CDM for derivatives; FIX → canonical trade event; ACORD AL3 / XML → canonical policy/claim event; HL7 v2 / FHIR → canonical clinical/claim event (where applicable); SWIFT seev → canonical corporate action; SWIFT camt → canonical cash event
- **Reference data master** — securities (FIGI/ISIN/CUSIP/SEDOL/RIC), counterparties (LEI), instruments (MIC), addresses, MCC/NAICS/SIC, currency (ISO 4217), country (ISO 3166), unit-of-measure
- **Currency normalization, FX enrichment** (intraday + EOD), **tax-lot handling** for investments, **cost-basis accounting** (FIFO/LIFO/Average/specific ID), **wash-sale tracking**, **corporate-action adjustments** (splits, dividends, spinoffs, mergers)
- **Valuation enrichment** — BVAL/ICE/Refinitiv prices, fair-value hierarchy (Level 1/2/3), accrued interest, dirty-vs-clean prices
- **Entity resolution / Master Customer/Counterparty Record (MCR + MCounterpartyR)** — probabilistic + deterministic matching across SSN/EIN/LEI, email, phone, device, address; handles synthetic-identity collisions and corporate-hierarchy rollups
- **Account, household, beneficial-ownership, and corporate-hierarchy graphs**; for capital markets, **parent-fund / sub-fund / share-class** hierarchy; for insurance, **policy / risk / coverage / claim** hierarchy
- **Counterparty and merchant MDM** — MCC, NAICS, SIC, LEI, GLEIF reference; merchant cleansing using Plaid/MX taxonomies + internal models; insurance carrier reference; broker / IMO / MGA reference
- **Deduplication, versioning, bi-temporal modeling** (valid-time + system-time) for audit and restatement
- **Common Data Models** — adopt and extend:
  - **FIBO** (Financial Industry Business Ontology) for entities, instruments, contracts
  - **ISO 20022 Business Components** for payment / cash / securities semantics
  - **FDC3** for desktop interop
  - **ACORD reference architecture** for insurance
  - **HL7 FHIR R4/R5** where PHI is touched
  - **ISDA CDM** for derivatives lifecycle
  - **FDX 6.x** for Section 1033 outbound
  - Plus a custom **Infinize Financial Canonical Model (IFCM)** that wraps the above and exposes one consistent semantic graph
- **Derived marts**:
  - Customer 360, Household 360, Counterparty 360
  - Transaction 360 (cross-rail), Trade 360 (cross-asset), Policy 360, Claim 360
  - Risk marts — AML, fraud, credit, market, liquidity, operational, model, conduct
  - Profitability — FTP, RAROC, customer-lifetime value, agent commission
  - Regulatory marts — Call Report, FR Y-14, HMDA LAR, Section 1071, BSA workspace, MiFID II RTS22, EMIR, CAT, NAIC Yellow Book, Schedule D, ORSA, RBC, IFRS-17 cohort, LDTI
  - Actuarial marts — earned premium, incurred loss, IBNR, paid loss triangles, exposure-by-peril, reinsurance ceded
  - Capital marts — RWA, CET1, leverage, LCR, NSFR, IRRBB

### 8. Medallion Data Lake — Bronze / Silver / Gold (+ Platinum)

For each tier specify: **purpose, contents, storage format, partitioning strategy, retention, access pattern, SLA, ownership, example tables**.

- **Bronze (Raw)** — immutable landing, source-faithful: raw ISO 20022 XML, raw ISO 8583 binaries, raw Nacha files, raw FIX logs, raw ACORD XML, raw FHIR bundles, raw Plaid JSON, raw core extracts (positional, fixed-width, EBCDIC where applicable), raw market data ticks. Partitioned by `source/ingestion_date/hour`. **Retention: 7+ years for BSA / SEC 17a-4 / NAIC; 10+ years for life / annuity / pension; indefinite for ledger and trade blotter.** Storage: S3 (or GCS/ADLS) with Object Lock in Compliance Mode for regulator-required immutability.
- **Silver (Conformed)** — parsed, validated, currency-normalized, deduped, entity-resolved, MCR-linked, FX-enriched, instrument-resolved (FIGI/LEI), bi-temporal. Both transaction-grain and account-grain (and trade-grain, position-grain, policy-grain, claim-grain) tables.
- **Gold (Curated / Semantic)** — business-ready marts as listed in §7. Modeled in dbt or SQLMesh; conformed dimensions; metrics catalog.
- **Platinum (Online Feature / Decision Tier)** — sub-second feature serving for **fraud authorization decisions (< 100 ms)**, **AML real-time pre-screening**, **market-access pre-trade risk (Rule 15c3-5, < 5 ms hot path)**, **underwriting decisioning**, **NBA next-best-action**. Backed by DynamoDB / Redis / Tecton / Feast / Aerospike with TTL-aware sync from Gold.
- **Lakehouse table format**: **Apache Iceberg** with time travel (essential for audit reconstruction, MAR/Sarbanes restatement, AML look-back); Delta and Hudi supported via abstraction layer for customers on Databricks
- **Compute**: EMR Serverless / Glue / Databricks / Snowpark — decoupled from storage; tenant-isolated compute
- **Query engines**: Athena, Redshift Spectrum, Snowflake external tables, Trino on EKS, BigQuery BigLake, direct Iceberg reads; **streaming consumers** — Flink, Spark Structured Streaming, Kinesis Data Analytics
- **File-level encryption** with tenant-scoped KMS CMKs; Lake Formation LF-Tags (or equivalent on Azure/GCP) for RBAC/ABAC
- **Data products** — each Gold mart is published as a versioned, contract-backed, SLA-bound **Data Product** in a Data Mesh / Data Product Marketplace pattern, with discovery, request-access, and consumption metering

### 9. Data Observability

- **End-to-end lineage** (column-level + transformation-level) across Bronze / Silver / Gold / Platinum — OpenLineage + Marquez pattern, exported to DataHub and to the customer's tool of choice (Collibra, Alation, Atlan, Informatica IDMC)
- **Freshness, volume, schema, distribution, null-rate, and reconciliation** anomaly detection per dataset
- **SLO dashboard per pipeline** — success rate, P95 latency, data delay, % records passing contract
- **Data downtime metric** (MTTD, MTTR) tracked and reported monthly — **sponsor-bank-review-ready, BCBS-239-aligned, DORA ICT-incident-register-aligned**
- **Alerting** — severity tiers: **P1** PII/PHI/PCI/MNPI exposure or material misstatement risk; **P2** AML/Fraud/Surveillance pipeline down or reg-report blocker; **P3** quality breach with business impact; **P4** warning
- **Incident timeline view** — every Bronze record traceable forward to every Gold/Platinum consumer; **critical for SAR forensics, Reg E disputes, MAR investigations, claims-leakage post-mortems**
- **Change-data-capture audit trail at every layer** — append-only, signed, S3 Object Lock
- **BCBS 239 conformance dashboard** — risk data aggregation principle scoring (accuracy, integrity, completeness, timeliness, adaptability)
- **DORA ICT-incident workflow** — classify (major / significant / non-major), initial notification timer (4 hours), intermediate report (72 hours), final report (1 month), with audit-grade artifacts

### 10. Data Quality, Cleanliness & Completeness

- **Six dimensions framework** — Accuracy, Completeness, Consistency, Timeliness, Uniqueness, Validity — scored per dataset and per critical field, plus a derived **Trust Score 0–100** per Gold mart
- **Rule types** — schema, range, referential, cross-field, temporal, statistical outlier, code-list-valid (MCC, NAICS, BIC, IBAN, ABA routing, LEI checksum, ISIN checksum, CUSIP check digit, FIGI, CAT reportable, ACORD enum)
- **Rules engine** — Great Expectations / Soda / dbt tests / Monte Carlo / custom; expressed as code + UI-editable
- **Quality scorecards** at source, Silver, and Gold; tracked over time
- **Data contracts** between producers and consumers — breaking changes blocked at CI; consumer-driven contract tests
- **Financial plausibility checks**:
  - Debits = credits at trial-balance close
  - ACH amount within Nacha PPD/CCD/IAT limits
  - ISO 20022 BIC valid and in current SWIFTRef
  - OFAC name-screening false-positive rate within band
  - FX-rate variance bounds (cross vs. triangulated)
  - Cardholder country vs. merchant country sanity
  - **Trade economics** — buy/sell consistency, settlement-date plausibility, accrued interest non-negative, dirty ≥ clean, NAV reconciliation to admin
  - **Position reconciliation** — internal vs. custodian, internal vs. prime broker, internal vs. fund admin
  - **Insurance** — earned premium ≤ written premium, loss ratio bounds, reserve adequacy triangles, ceded reconciliation to reinsurer bordereaux
  - **Lending** — APR consistency, escrow analysis, payment waterfall
- **Completeness matrices** for regulatory reports (Call Report line items, HMDA LAR fields, Section 1071, BSA SAR critical fields, MiFID II RTS-22 65-field requirement, EMIR REFIT 203-field, CAT 200+ field, NAIC Schedule D, RBC formula inputs) — show which source fields drive each report cell
- **Quarantine + remediation** workflow with data steward assignment and SLA timer
- **Reconciliation framework** — Bronze trial balance vs. core; Silver ledger vs. processor settlement; Silver positions vs. custodian; Gold marts vs. independent calculation; Gold regulatory marts vs. last-filed report

### 11. Data Governance (full program, not just RBAC)

- **Catalog** — business glossary, technical catalog, physical catalog (AWS Glue Data Catalog + DataHub + customer's Collibra/Alation/Atlan/Informatica IDMC connectors). Every column has a business term, owner, steward, classification, sensitivity tier (**Public / Internal / Confidential / NPI / PCI / PHI / MNPI / Authentication Secret / Trade Secret**).
- **Stewardship model** — domain-based (Payments, Lending, Deposits, Cards, Trading, Investments, Underwriting, Claims, Risk, Compliance, Customer, HR), with a published RACI per domain
- **Policy library** — **purpose-based access** (treatment of NPI under GLBA, PCI under PCI-DSS v4.0.1, PHI under HIPAA, MNPI under SEC Reg FD and information-barriers, MiFID II personal-data restrictions), least-privilege, break-glass with mandatory post-hoc review
- **Access control** — RBAC + ABAC + PBAC, row-level security per legal entity / line-of-business / state / desk / fund / book, column-level masking by sensitivity tier
- **Information barriers ("Chinese walls")** — desk-level segmentation for sell-side and buy-side; enforced at query time and audit-logged
- **Consent management** — per-customer consent flags honored at query time, including **Section 1033 third-party authorizations and revocations (FDX 6.x)**, HIPAA authorizations, GDPR Article 6 lawful-basis tracking, CCPA/CPRA opt-outs, do-not-share-with-affiliates flags
- **Tokenization & Encryption** — format-preserving encryption for PAN/SSN/EIN/NPI/PHI; dynamic masking for analyst views; **deterministic tokenization** for join keys across teams without re-identification
- **Privacy audit log** — who accessed which customer/policy/account/trade, which field, for what purpose, with justification text (immutable, S3 Object Lock Compliance Mode)
- **Data retention & purge** — per-jurisdiction schedules (BSA 5-yr minimum, SEC 17a-4 6-yr WORM, NAIC 7–10-yr, IFRS-17 contract-boundary retention, GDPR/CCPA right-to-be-forgotten scoped to applicable jurisdictions and excluding legal-hold subjects)
- **Change management** — DAG of policy and schema changes with approver chain; ties to **SR 11-7 model-risk traceability** and the customer's existing change-management tool (ServiceNow, Jira)
- **AI / Model Governance** — model registry, model card per model, training-data lineage, performance monitoring, drift detection, bias/fairness testing (ECOA-aligned), challenger-model framework, model retirement workflow; full **SR 11-7** and **EU AI Act** alignment for high-risk uses (credit, fraud, AML, underwriting, pricing)

### 12. 360° Insights with Natural Language Query — *the demo moment*

Specify in detail:

- **Text-to-cohort** — "Show me HNW clients in CA and NY with both a deposit relationship and a wealth advisory account, who have transacted across 3+ states last quarter, and hold no current loan, and have not been contacted by an advisor in 60 days."
- **Text-to-insight** — "What's driving the spike in ACH returns last week, and which originator is responsible?" / "Where is my loss ratio worst this quarter and what perils drive it?" / "Which traders breached pre-trade limits this month and what was the override pattern?"
- **Conversational drill-through** on dashboards
- **Semantic layer** powered by dbt + a metrics store (Cube, Atscale, or native Iceberg metrics layer) so NL queries resolve against governed metrics, not raw tables. Every metric has an owner, a definition, a lineage, and a certification badge.
- **Retrieval pattern**: NL → intent classifier → semantic-layer metric/dimension resolver → SQL generator (Claude on Bedrock / Vertex / Azure OpenAI) → guardrail validator → execution → result + source citation
- **Guardrails** — no queries outside user's RBAC/ABAC scope; no PII/PAN/PHI/MNPI in prompt or logs; every answer cites tables and rows-returned; automatic tokenization when scope is research/marketing; **information-barrier enforcement** for sell-side queries; **MAR/Reg-FD safe-harbor for analyst-facing copilots**
- **Explainability** — show the generated SQL, the metric definitions used, the row count, the confidence band, and the version of the model that answered
- **AI Copilots** (each grounded, each auditable):
  - **AML/SAR drafting copilot** — summarize last 12 months of activity, flag the typology (structuring, layering, mule, smurfing, trade-based), draft narrative with citations; never auto-files
  - **Surveillance copilot** — explain a market-abuse alert in plain English with cited orders, executions, news, comms
  - **Claims copilot** — summarize first notice of loss, recommend next actions, flag potential fraud per SIU rules
  - **Underwriting copilot** — assemble a risk packet for a commercial submission, with cited losses, exposures, modeled cat losses, MGA notes
  - **Advisor copilot** — household summary, recent activity, suitability flags, NBA suggestions (Reg BI-compliant)
  - **Reg-reporting copilot** — explain a Call Report line item, trace to source rows, summarize period-over-period change
- **Grounding** — every AI response cites source records; no ungrounded factual claims; refusal pattern when context is insufficient
- **Sample transcripts** — 18 realistic questions across CDO, CRO, BSA Officer, Chief Actuary, CIO, Portfolio Manager, Underwriter, Claims Adjuster, Controller, Treasurer

### 13. Analytics & Application Surfaces (Gold consumers)

- Customer 360 / Household 360 / Counterparty 360 (single pane of glass for support, RMs, underwriters, advisors)
- Transaction 360 (cross-rail), Trade 360 (cross-asset), Position & NAV view
- Policy 360, Claim 360, Loss-Ratio cockpit, Reinsurance cession view
- AML Investigations & SAR workspace
- Sanctions screening hit-resolution
- Fraud Operations console (real-time scoring + case management)
- Market Abuse / Trade Surveillance (insider, spoofing, layering, wash, marking-the-close)
- eComms surveillance dashboard
- Credit & Underwriting feature store
- Profitability / FTP / RAROC at account, household, fund, book, desk, agent levels
- Liquidity, ALM, CECL/IFRS-9 inputs
- Insurance reserving & IBNR triangles, IFRS-17 cohort viewer, LDTI assumption viewer
- Regulatory Reporting workspaces (see §14)
- Marketing analytics on governed data (no PII leakage)
- Embedded analytics for partner banks, BaaS clients, brokers, MGAs

### 14. Regulatory Reporting Engine

A dedicated module — this is where many deals get won. Spec:

- **Report library** with one-click assembly, source-to-line lineage, period-over-period diff, sign-off workflow, e-file integration:
  - **US Banking** — Call Reports (031/041/051), UBPR, FR Y-9C/SP/LP, FR Y-14 (CCAR/DFAST), FR Y-15, FFIEC 002, 009; HMDA LAR; Section 1071; CRA Assessment; FR 2052a (LCR); FFIEC Cybersecurity Profile; LCR/NSFR daily
  - **US BSA/AML** — SAR, CTR, Form 8300, FBAR (114), 314(a) responses, 314(b) cooperative requests, OFAC blocked/rejected reports
  - **US Capital Markets** — CAT, MiFID-equivalent OATS legacy, TRACE, Form PF, Form 13F, Form ADV, Form CRS, Form N-PORT, Form N-CEN, EBS, COBRADesk, Rule 606, Reg SHO, 17a-25
  - **US Insurance** — NAIC Annual & Quarterly statements (incl. Schedule D, Schedule F, Schedule P), RBC, ORSA Summary Report, MAR attestation, state DOI filings, MCAS (Market Conduct Annual Statement)
  - **US Tax** — 1099 family, 1098 family, 5498, W-9/W-8, FATCA 8966, CRS XML
  - **EU** — MiFID II RTS-22, EMIR REFIT, SFTR, CSDR settlement penalties, AIFMD Annex IV, FATCA/CRS, DORA Register of Information, ESG/SFDR Articles 8/9
  - **UK** — RegData (FCA), CASS, AIFMD-equivalent
  - **Cross** — IFRS 9 ECL, IFRS 17 cohorts, LDTI assumption packs, Basel III/IV RWA & capital
- **Calc kernel** — versioned, model-risk-governed (SR 11-7), with golden test cases per report
- **Diff & lineage viewer** — every cell click shows source rows, applied transformations, and the policy/business term backing the calculation
- **Sign-off workflow** — preparer / reviewer / approver / certifier; immutable audit log
- **Filing connectors** — FFIEC CDR, FinCEN BSA E-File, IRS FIRE & IRIS, NAIC Internet Filing, EU regulator portals via accredited filing partners

### 15. Reference Architecture on AWS (primary) + Azure/GCP parity notes

Describe layer-by-layer (will be turned into draw.io separately):

- **Landing & Ingest** — AWS Transfer Family (SFTP), Kinesis, MSK, AppFlow, API Gateway, EventBridge, Lambda webhooks; dedicated VPC endpoints / PrivateLink to processor and vendor partners (Marqeta, Stripe, Plaid, Guidewire Cloud, Bloomberg DAPI, Refinitiv RDP); IBM CDC / Precisely Connect for mainframe extracts
- **Storage** — S3 with zone-based prefixes (`/bronze/{source}/ingest_date=…`, `/silver/payments/`, `/silver/trades/`, `/silver/policies/`, `/silver/customers/`, `/gold/{mart}/`); Iceberg catalog in Glue (or Snowflake / Databricks Unity Catalog with abstraction layer); S3 Object Lock Compliance Mode for regulator-required immutability
- **Processing** — EMR Serverless (Spark/Flink), Glue for lightweight ETL, Lambda for event transforms, Step Functions for orchestration, MWAA / Airflow for scheduled DAGs, dbt Core/Cloud for Silver→Gold
- **Streaming layer** — Kinesis + Managed Service for Apache Flink for real-time AML/fraud, market access pre-trade, claims-fraud, NBA; sub-100 ms decisioning loop with Platinum tier (DynamoDB/Redis/Tecton)
- **Serving** — Redshift Serverless, Athena, Trino on EKS, Aurora PostgreSQL for case-management apps, DynamoDB for online feature serving, OpenSearch for case/notes search
- **AI/ML** — SageMaker (registry, training, hosting, Clarify, Model Monitor), Bedrock with Anthropic Claude for NL→SQL, summarization, AML/SAR drafting, claims & underwriting copilots; OpenSearch + Bedrock Knowledge Bases for RAG; SageMaker Feature Store (or Tecton/Feast)
- **Governance** — Lake Formation, DataZone, Glue Data Catalog, Macie for PII/PAN/PHI/MNPI discovery, custom Catalog UI; OpenLineage collector; integration with Collibra/Alation/Atlan/Informatica IDMC
- **Security** — IAM Identity Center, KMS CMK per tenant, AWS Payment Cryptography for PIN/PAN ops, GuardDuty, Security Hub, CloudTrail Lake, Config, WAF, Shield, AWS Network Firewall, Inspector, Detective; SIEM via Splunk/Sumo/Chronicle/Sentinel
- **Operations** — CloudWatch, X-Ray, OpenTelemetry, OpenLineage collector, custom Observability UI; PagerDuty/Opsgenie integration
- **Multi-tenancy strategy** — **account-per-tenant** for Tier-1 banks, custodians, carriers, BaaS providers; **pooled-with-isolation** (Lake Formation LF-Tag + CMK-per-tenant) for fintech startups and smaller carriers. **Justify each path with cost, blast-radius, regulator-evidence, and DR considerations.**
- **Environment strategy** — Dev / Test / Stage / Prod, plus dedicated **Demo** account for sales, **PCI-scoped** account for cardholder data isolation, **PHI-scoped** account if health insurance is in scope, **MNPI-scoped** account for sell-side / IB advisory
- **AWS Control Tower** alignment to a 14-account org with Security Tooling delegated admin; Service Control Policies enforcing data-residency and encryption baselines
- **Azure parity** — Synapse + Fabric + Purview + Sentinel + Key Vault; ADLS Gen2 with Iceberg; Event Hubs / Stream Analytics
- **GCP parity** — BigQuery + BigLake (Iceberg) + Dataproc + Pub/Sub + Dataflow + Dataplex + SCC + KMS

### 16. Security & Regulatory Compliance Matrix

Produce a **compliance matrix** table: `Regulation / Framework | Scope | Key Requirements | How the Hub addresses it | Evidence artifact | Cadence | Owner`.

Must cover (US, EU, UK, APAC, cross-border):

**US Banking & Payments**
- GLBA — Safeguards, Privacy, Pretexting
- BSA / AML Act 2020 — CIP, CDD, EDD, BO, SAR/CTR/8300, ongoing monitoring, AML/CFT priorities
- OFAC sanctions
- FCRA / FACTA — credit use, adverse action, ITPRP / Red Flags
- ECOA / Reg B, FHA, UDAAP — fair lending and disparate impact
- Reg E, Reg Z, Reg DD, Reg P, Reg CC, Reg W, Reg O
- HMDA, CRA, Section 1071
- CFPB Section 1033 + FDX 6.x
- PCI-DSS v4.0.1
- Reg II (Durbin)
- NYDFS 23 NYCRR 500 (incl. 2023 amendments — CISO, BCP, MFA, vulnerability mgmt, third-party risk, incident notification 72 hours)
- FFIEC — IT Examination Handbook (AIO, IS, BCP, Outsourcing, Cybersecurity Assessment Tool)
- OCC Heightened Standards
- OCC Bulletin 2013-29 / 2020-10 (third-party risk)
- SR 11-7 (Model Risk), SR 15-18, SR 16-11, SR 21-3 (interagency model risk for AML)
- FDIC FIL guidance, Interagency Guidance on Third-Party Relationships (June 2023)

**US Capital Markets**
- SEC Reg NMS, Reg ATS, Reg SHO, Reg S-P (amended 2024), Reg S-ID, Reg SCI, Reg Best Interest
- Rule 15c3-1, 15c3-3, 15c3-5 (Market Access), 17a-3, 17a-4 (incl. 2022 amendments allowing audit-trail alternative to WORM), 17a-25
- Rule 613 / CAT, FINRA TRACE, MSRB EMMA/RTRS
- CFTC Dodd-Frank Title VII swap data
- T+1 settlement (live since May 28, 2024)
- Investment Advisers Act 1940 (incl. 2024 Marketing Rule), Investment Company Act 1940
- SEC Cybersecurity Risk Mgmt Rule (Form 8-K Item 1.05)

**US Insurance**
- NAIC Model Audit Rule (MAR), ORSA, RBC, SAP
- NAIC Insurance Data Security Model Law (#668) and state adoptions
- Holding Company Act
- ACA (health), HIPAA Privacy & Security (where PHI is touched), HITECH
- IFRS 17 / LDTI (US GAAP ASU 2018-12)
- TRIA
- State DOI cybersecurity regs (now in 25+ states)

**Privacy & Cyber (US state + federal)**
- CCPA/CPRA, VCDPA, CDPA, TDPSA, CTDPA, UCPA, OCPA, MTCDPA, INCDPA, DPDPA, Washington MyHealthMyData
- FTC Safeguards Rule (2023 amendments)
- SEC Cybersecurity Rule, NYDFS 500, NAIC #668

**EU / UK / APAC**
- GDPR, UK GDPR
- DORA — ICT Risk Management, ICT Incident Reporting, Digital Operational Resilience Testing, ICT Third-Party Risk, Information Sharing, Register of Information
- MiFID II / MiFIR (RTS 22 transaction reporting, RTS 23 reference data, best-ex)
- EMIR REFIT (203-field transaction reporting), SFTR, CSDR settlement discipline
- PSD2 / PSD3 + PSR (under rulemaking 2024-2026)
- Solvency II, IDD
- AIFMD Annex IV
- NIS2
- FCA / PRA SS1/21, SYSC, CASS, Consumer Duty
- Canada — OSFI B-13, PIPEDA, CASL
- Singapore — MAS TRM Notice & Guidelines, PDPA
- Australia — APRA CPS 234, CPS 230, CPS 232
- India — DPDPA, RBI cybersecurity framework, RBI digital lending guidelines
- Hong Kong — HKMA cyber resilience

**Cross-cutting**
- SOX (ITGCs, change mgmt, access)
- SOC 1 Type II, SOC 2 Type II, ISO 27001/27017/27018/27701
- NIST CSF 2.0, NIST SP 800-53
- FedRAMP-equivalent controls if serving regulated treasury/government
- AWS / Azure / GCP FSI compliance programs
- **BCBS 239** risk data aggregation principles
- **SEC/FINRA off-channel comms** capture (WhatsApp/iMessage/Signal) — Smarsh, Global Relay, Theta Lake
- **Sponsor-bank-grade evidence packet** — automated quarterly export per AML Act 2020 effectiveness review and SR 11-7
- **DORA Register of Information** — annual report to ESAs; auto-assembled from Hub catalog

Include: encryption (KMS CMK per tenant, field-level tokenization for PAN/SSN/EIN/PHI, envelope encryption, BYOK and HYOK options), key rotation policy, break-glass with post-hoc review, **tamper-evident audit log (append-only, S3 Object Lock Compliance Mode, optional WORM tape archive for SEC 17a-4 customers electing WORM track)**, immutable retention, **DR RPO ≤ 1 min for ledger and trade events / RPO ≤ 5 min for risk and AML / RPO ≤ 15 min for analytics / RTO ≤ 1 hr for core surfaces / RTO ≤ 4 hr for analytics**, multi-region active-active for payments and trading, vendor-risk-mgmt chain (every subprocessor mapped to SOC 2 + DR attestation + DORA TPP registration where applicable).

### 17. Non-Functional Requirements

- **Scale envelopes** — define **Reference Customer profiles** with explicit volumes:
  - Community bank: 1M customers / 2B txns / 50M trades+investment events / 0 policies
  - Regional bank: 5M customers / 15B txns / 500M investment events
  - Money-center bank: 50M customers / 200B txns / 50B trade/market events
  - Mid-size P&C carrier: 3M policies / 20M claims-life events / 500M telemetry events
  - Top-10 carrier: 30M policies / 200M claims-life events / 5B telemetry
  - Asset manager: 5K funds / 5M positions / 100M trades / 10B market-data events daily
  - Wealth platform: 2M households / 8M accounts / 200M positions-time-series / 1B txn events
  - Neobank: 15M customers / 30B txns
  - Payments processor: 100B annual authorizations
- **Performance** — P95 dashboard < 2s, NL query < 6s, **real-time fraud decision < 100 ms**, **market-access pre-trade < 5 ms**, ISO 20022 ingest latency < 30s, ACH batch < 30 min, EOD Call Report assembly < 4 hr, EOD NAV assembly < 90 min, EOD reserving cube refresh < 2 hr
- **Availability** — 99.95% Prod, 99.5% Demo; **payment-authorization and order-routing paths 99.99% multi-AZ active-active, multi-region active-passive with < 60s failover**
- **Accessibility** — WCAG 2.2 AA, keyboard-first
- **Localization-ready** — en-US first; es-US, en-GB, fr-CA, en-CA, fr-FR, de-DE, ja-JP, zh-CN next
- **Browser support** — evergreen Chrome, Edge, Safari, Firefox; degraded support for last 2 Safari iPad versions for relationship managers in branches
- **Tenant isolation** — verifiable; pen-tested annually; cross-tenant query impossible by design

### 18. Implementation Plan

- **16-week Foundation Phase** broken into 2-week sprints with explicit demo milestones:
  - Sprint 1-2: source onboarding + Bronze
  - Sprint 3-4: Silver + quality + lineage
  - Sprint 5-6: first Gold mart (Customer 360) + NL query alpha
  - Sprint 7-8: AML + fraud + sanctions integration
- **Production Hardening Phase (weeks 17-32)** — second sub-sector (e.g., wealth or insurance), regulatory reporting module, AI copilots, DORA register, sponsor-bank evidence packet automation
- **RACI**, team composition, skills required — must include a **financial-services SME from Day 1** (banking, capital markets, insurance, or wealth depending on prospect), **a model-risk lead by Sprint 3**, **a compliance lead by Sprint 1** — non-negotiable
- **Pricing model options** — tenant-based, customer-count-based, transaction-volume-based, consumption-based, hybrid; with a sample TCO for: (a) 3M-customer community bank, (b) 30M-customer carrier, (c) $200B-AUM asset manager
- **Deployment options** — Infinize-hosted SaaS, customer-VPC (BYOC), hybrid with PCI-scoped enclave option, fully air-gapped option for government/sovereign customers

### 19. Risks, Open Questions, Sales Objection Handling

- **Top 12 risks** with mitigations — sponsor-bank approval, custodian onboarding, carrier IT change-control, PCI scope creep, PHI scope creep, MNPI handling missteps, model-risk-governance maturity gap, Section 1033 rule volatility, DORA TPP registration timing, multi-state money-transmitter exposure, vendor-lock on cloud, talent for FinServ SMEs
- **Top 20 prospect objections** with crisp rebuttals — e.g., *"We already have Snowflake FSI"*, *"Databricks LakehouseFSI does this"*, *"BlackRock uses Aladdin"*, *"Plaid does this"*, *"We can't put NPI in the cloud"*, *"Our core vendor blocks data extraction"*, *"Our sponsor bank won't approve a new vendor"*, *"We just spent $40M on a data lake"*, *"Our actuaries won't trust a model they didn't build"*, *"Our PMs won't switch off Aladdin"*, *"Our regulator hasn't approved AI for SAR drafting"*, *"DORA TPP registration is a blocker"*, *"Our auditor demands WORM"*, *"We're already in a Collibra rollout"*

### 20. Appendix

- **Glossary** — BSA, AML, CDD, EDD, CIP, SAR, CTR, OFAC, KYC, KYB, MCR, NPI, PCI-DSS, MNPI, PHI, ISO 20022, ISO 8583, ISO 15022, Nacha, RTP, FedNow, FIX, FpML, ISDA CDM, ACORD, HL7, FHIR, FIGI, LEI, ISIN, CUSIP, SEDOL, RIC, MIC, MCC, BIN, IBAN, BIC/SWIFT, ABA, ACH, FBO, BaaS, FTP, RAROC, RWA, CET1, LCR, NSFR, IRRBB, CCAR, DFAST, IFRS 9, IFRS 17, LDTI, ORSA, RBC, MAR, SAP (insurance), SAR (trading — Securities Act Release), SR 11-7, BCBS 239, DORA, MiFID II, EMIR, SFTR, CSDR, PSD2/3, GDPR, CCPA, CPRA, etc.
- **Sample artifacts** — ISO 20022 `pacs.008`, ISO 8583 authorization, Nacha file, Plaid Transactions JSON, FIX 4.4 ExecutionReport, ACORD XML policy, FHIR R4 Claim resource, FpML 5.11 IRS confirm
- **Sample NL → SQL** translations with full guardrail logs and citation chips
- **Sample data contract** YAML
- **Sample Great Expectations / Soda** rule file
- **Sample SAR draft, market-abuse case narrative, claim-fraud SIU referral, and reg-report explainer** generated by the AI copilots, each with citations and a guardrail badge
- **Sample DORA Register of Information** rows
- **Sample SR 11-7 model card** for the AML monitoring model

### 21. Diagrams

Provide mermaid diagrams for:

1. End-to-end reference architecture
2. Medallion flow (Bronze → Silver → Gold → Platinum)
3. NL-query resolution with guardrails
4. Governance, consent & information-barrier enforcement
5. AML alert lifecycle (alert → investigation → SAR draft → file → audit)
6. Trade lifecycle across OMS/EMS → execution → confirmation → settlement → reconciliation → reporting
7. Policy & claim lifecycle (FNOL → triage → adjudication → payment → subrogation → reserving)
8. Regulatory reporting assembly (Bronze → Silver → Gold → Report Cell → Filing)
9. DORA ICT incident workflow
10. Model lifecycle (SR 11-7) — develop → validate → deploy → monitor → retire

---

## PART B — Interactive Prototype Requirements

Build a **single-file React artifact** (TypeScript optional, Tailwind utility classes) that renders a working, navigable prototype of the Hub. No backend calls — use realistic in-memory synthetic data spanning **banking, capital markets, insurance, and wealth**. Must **not** use `localStorage` or `sessionStorage`. All state in React hooks.

### Required Screens (all navigable from a persistent left sidebar)

1. **Executive Home** — KPI tiles (customers, accounts, policies in force, AUM, trades today, transactions today, sources healthy, data freshness, NL queries today, trust score, open AML alerts, open fraud cases, open surveillance alerts, open claims-fraud SIU referrals, regulatory reports due in 7 days, DORA ICT incidents open). Sub-sector toggle (Banking / Capital Markets / Insurance / Wealth / All) reshapes the tiles.
2. **Source Catalog** — filterable table of all connected sources with health score, owner, last run, sensitivity tier, schema version, sub-sector tag; row click → Source Detail drawer with schema, lineage preview, recent runs, contract, reconciliation summary.
3. **Add Source Wizard** — 9-step flow: Type → Sub-Sector → Protocol → Credentials → Schema Map → Sensitivity → Quality Rules → Lineage Tags → Review. Progress indicator, back/next, realistic form fields tuned to FinServ sources (cores, processors, KYC, sanctions feeds, OMS/EMS, FIX, custody, market data, policy admin, claims, ACORD, FHIR).
4. **Ingestion Pipelines** — list view with status, throughput, latency, success rate; row → Pipeline Detail with DAG graph, run history, DLQ count, replay button, reconciliation panel.
5. **Medallion Explorer** — three-column Bronze / Silver / Gold browser (plus an optional Platinum column toggle); pick a dataset on any tier and see its schema, sample rows (fully tokenized), partitions, lineage upstream/downstream.
6. **Data Quality Console** — scorecards per dataset across the six dimensions; drill into a failing rule (e.g., `txn_amount within Nacha limits`, `BIC valid`, `MCC populated`, `LEI checksum valid`, `ISIN check digit valid`, `ACORD enum valid`, `loss-ratio within band`, `reserve adequacy triangle within band`) to see offending rows, assign to steward, mark remediated.
7. **Observability Dashboard** — pipeline SLOs, freshness heatmap, anomaly timeline, incident list with MTTD/MTTR, lineage incident blast radius, **BCBS 239 conformance gauges**, **DORA ICT incident clock**.
8. **Data Governance / Catalog** — business glossary search, asset detail with owner, steward, sensitivity tier, classifications, policies applied, access requests, **information-barrier indicator**.
9. **Access & Policies** — RBAC/ABAC/PBAC matrix, purpose-of-use picker, break-glass log, consent flags view for a sample customer (including Section 1033 third-party authorizations under FDX 6.x), HIPAA authorizations for an insurance subject, MNPI access-restriction badges.
10. **Customer 360 / Household 360 / Counterparty 360** — demographics (tokenized), accounts (deposit, card, loan, investment, policy), recent transactions/trades/claims across rails, risk score, AML watchlist hits, products held, lifetime value, AI summary card with citations. Sub-sector tabs.
11. **Transaction & Trade 360** — unified search across ACH, wire, RTP, FedNow, card, internal transfer, equity/fixed-income/derivative trade events; rich detail panel with ISO 20022 / FIX / ACORD fields, related party graph, fraud/surveillance signals, related disputes.
12. **AML Investigations** — case worklist, alert detail with typology classification, transaction timeline, related-party graph, **AI-assisted SAR draft** with citations and guardrail badges, e-file readiness checklist.
13. **Fraud Operations** — real-time alert feed, case detail with device + behavioral signals, decision history, model score breakdown, action buttons (block, hold, release).
14. **Trade Surveillance** — alert worklist (insider, spoofing, layering, wash, marking-the-close), case detail with order/exec timeline, related news, eComms snippets, AI explanation, MAR/Reg-FD compliance badges.
15. **Claims Operations** — FNOL queue, claim detail with ACORD fields, photos placeholder, fraud-risk score (SIU), reserve recommendation, subrogation indicator, reinsurance ceded status, AI claims summary.
16. **Underwriting Workbench** — submission queue (personal lines, commercial lines, life, annuity), risk-packet view with cited exposures and losses, modeled cat losses, MGA notes, AI underwriting copilot card.
17. **Portfolio & Position View** (wealth/asset mgmt) — household → account → position drill-down, performance vs. benchmark, attribution, suitability flags (Reg BI), AI advisor copilot card.
18. **NL Insights (the demo screen)** — chat-style interface. User types a question, prototype shows:
    - Intent → resolved metric + dimensions
    - Generated SQL (collapsed by default)
    - Chart + table result
    - Citation chips linking to source datasets
    - Guardrail badge (sensitivity scope, RBAC OK, row count, tokenization status, information-barrier check)
    - Follow-up suggestions
19. **Regulatory Reporting** — Call Report assembly view, HMDA LAR, Section 1071, BSA SAR/CTR queue, MiFID II RTS-22 sample, CAT sample, NAIC Yellow Book Schedule D excerpt, IFRS-17 cohort view, IRS information returns; each shows source-to-line-item lineage and a diff vs. prior period.
20. **Compliance Center** — regulation cards (GLBA, BSA/AML, OFAC, PCI-DSS v4.0.1, NYDFS 23 NYCRR 500, Reg E/Z/DD/P/CC, FCRA, SOX, SR 11-7, CCPA/CPRA, Section 1033, NAIC MAR, ORSA, RBC, HIPAA (toggleable), MiFID II, EMIR, DORA, SFDR) each with status, controls implemented, evidence artifacts, audit log viewer, **export sponsor-bank evidence packet** button.
21. **Model Governance (SR 11-7)** — model registry, model card per model (purpose, training data lineage, performance metrics, fairness metrics, drift, owner, validation status, next review date), challenger comparison, retirement workflow.
22. **DORA Center** — ICT third-party register, incident workflow (classify → notify 4hr → intermediate 72hr → final 1mo), resilience-testing calendar, register-of-information export.
23. **Admin Console** — tenants, users, roles, API tokens, connector SDK docs link, environment switcher.

### Global UX Requirements

- Persistent **dark left sidebar** with Infinize logo placeholder, collapsible section groups (grouped by: Overview / Data Operations / Insights & 360 / Risk & Compliance / Reporting / Admin), active state indicator
- **Top bar** — tenant switcher, sub-sector switcher (Banking / Capital Markets / Insurance / Wealth / All), role toggle (`Analyst | Steward | Risk | Compliance | Underwriter | Advisor | Admin`), global search (⌘K), notifications bell with badge, user menu
- **Role and sub-sector toggles must actually change** the visible content on every screen
- **Command palette** (⌘K) — fuzzy search across screens, datasets, customers, cases, policies, trades
- **Notifications panel** — DQ breach, pipeline failure, new access request, AML alert, fraud case, surveillance alert, claim fraud referral, reg-report due, DORA incident
- **Empty, loading, and error states** on every screen with helpful copy
- **Keyboard navigation** and visible focus rings

### Design System (Infinize Theme)

- **Font** — Plus Jakarta Sans (Google Fonts)
- **Sidebar** — deep navy/near-black `#0B1020` range, 240px expanded / 64px collapsed
- **Canvas** — light mode `#F7F8FB`, cards `#FFFFFF` with subtle shadow; dark mode `#0F1117` canvas, `#161A23` cards
- **Accent / primary** — Infinize blue-violet `#5B6CFF` used sparingly for primary CTAs and active nav
- **Status colors** — success `#16A34A`, warning `#F59E0B`, danger `#DC2626`, info `#2563EB`
- **Rounded corners** — 10–12px for cards, 8px for inputs, 6px for chips
- **Icons** — lucide-react, 1.5–1.75 stroke
- **Tables** — tabular numerals, zebra-free, 40px row height for transaction grids, sticky headers, column chooser
- **Charts** — recharts (line, bar, area, donut). Single accent + neutral grayscale, no rainbow palettes.
- **Motion** — 150ms ease-out, no bouncing
- **Density toggle** in top bar (Compact / Comfortable)
- **Dark mode toggle** — ship both

### Synthetic Data Requirements

- **80 customers/households** with realistic, diverse names; tokenized SSNs, addresses, phones; accounts spanning deposit, card, loan, investment, policy, annuity; 18 months of mixed-rail transactions
- **30 sources** spanning all sub-sectors — cores (Fiserv DNA, Jack Henry SilverLake), card processors (Marqeta, Stripe Issuing), payment rails (ACH, wire, RTP, FedNow), KYC (Persona, Alloy), sanctions (OFAC, Dow Jones), aggregation (Plaid, MX), OMS (Charles River), EMS (Bloomberg EMSX), market data (Bloomberg, Refinitiv), custody (BNY, State Street), policy admin (Guidewire PolicyCenter, Duck Creek), claims (Guidewire ClaimCenter), underwriting (Verisk LightSpeed, RMS), wealth (Envestnet, Orion), CRM (Salesforce FSC), ERP (Workday), product analytics (Amplitude) — each with health score, last-run timestamp, sub-sector tag
- **18 pipelines** with varied states (healthy, warning, failed, running) spanning batch, micro-batch, streaming, CDC
- **35 quality rules** with pass/fail counts (BIC valid, ABA routing valid, MCC populated, Nacha amount limits, OFAC name-match threshold, LEI checksum, ISIN check digit, ACORD enum, FIX seq integrity, loss-ratio band, reserve triangle band, debits=credits, etc.)
- **12 open AML alerts** spanning structuring, layering, rapid-movement, mule, trade-based, smurfing typologies
- **10 open fraud cases** with device + behavioral signal breakdowns
- **8 open trade surveillance alerts** (insider, spoofing, layering, wash, marking-the-close)
- **10 open claims-fraud SIU referrals**
- **8 open commercial / specialty underwriting submissions**
- **12 pre-canned NL queries** with full resolution artifacts (generated SQL, chart, citations) covering every persona
- **6 regulatory report assemblies** (Call Report excerpt, HMDA LAR sample, BSA SAR draft, MiFID II RTS-22 sample, CAT sample, NAIC Yellow Book Schedule D excerpt) with source-to-line lineage
- **6 model cards** in the SR 11-7 registry (AML monitoring, card fraud, credit risk, claims fraud, loss reserving, NL→SQL guardrail classifier)

### Prototype Technical Constraints

- Single React artifact, default export component
- Use **react, recharts, lucide-react** only (plus Tailwind utility classes)
- **No `localStorage` / `sessionStorage`**
- No external API calls — everything in-memory
- Must compile and render without modification in a Claude.ai React artifact
- Lazy-render heavy screens
- All sensitive-looking data must be visibly tokenized (e.g., SSNs as `***-**-1234`, PANs as `4111 **** **** 1234`, account numbers as `****1234`, EINs as `**-***1234`, LEIs full-shown but counterparty names tokenized when MNPI-tagged) to demonstrate the platform's privacy posture in screenshots

---

## Output Format & Tone

- **Part A** in clean Markdown with heading hierarchy, tables, fenced code, and the mermaid diagrams listed in §21.
- **Part B** as the React artifact.
- **Tone** — confident, financial-services-literate, sales-aware, zero fluff. Write for a room containing a **CDO, a CRO, a CCO, a BSA Officer, a CISO, a Chief Actuary, a CIO, a Portfolio Manager, and an AE** — all reading the same document.

**Before you begin**: state your assumptions about the target prospect (`{{ default: "a US-domiciled multi-line financial services group with $80B AUM, including a Tier-2 regional bank (5M customers, Fiserv DNA core, Marqeta-issued debit, ACH + wire + RTP via the Fed, FedNow live), a wealth platform (1M households, Envestnet + Orion, Charles River OMS, BNY custody, ~$120B AUM), and a P&C insurance subsidiary (3M policies on Guidewire, Verisk + RMS underwriting, ceding to Munich Re); evaluating a Snowflake-FSI vs. Databricks-FSI consolidation, with active sponsor-bank scrutiny from their card BIN sponsor and active SEC + state DOI examinations; planning DORA readiness for a small UK booking entity by year-end" }}`) and then produce Part A in full. After Part A is complete, produce Part B.
