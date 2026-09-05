/**
 * The seed stock universe.
 *
 * The spec requires the universe to be database-driven so symbols can be added
 * or removed without a code change — and it is: at runtime the worker and the
 * web app read sectors from Postgres. This file is the *seed source*, shared by
 * `prisma/seed.ts` and by the static fallback used when DATABASE_URL is unset,
 * so the two can never drift apart.
 *
 * The sector lists in the brief were a starting point of ~115 names. They are
 * expanded here to the 150-250 liquid names the spec asks for, and widened with
 * the market-moving groups the start list omitted (crypto/fintech, retail,
 * media, industrials, travel, metals). Editing this file is *not* the intended
 * way to change the universe in production — that is a database concern — it is
 * only what a fresh install starts with.
 */

import type { Universe, UniverseSector, UniverseStock } from '../types';

export interface SectorSeed {
  id: string;
  name: string;
  description: string;
  symbols: Array<{ symbol: string; name: string; exchange: string; weight?: number }>;
}

export const SECTOR_SEED: SectorSeed[] = [
  {
    id: 'semiconductors',
    name: 'AI / Semiconductors',
    description: 'Semiconductor designers, foundries, equipment makers and memory.',
    symbols: [
      { symbol: 'MU', name: 'Micron Technology Inc.', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
      { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ' },
      { symbol: 'MRVL', name: 'Marvell Technology Inc.', exchange: 'NASDAQ' },
      { symbol: 'ARM', name: 'Arm Holdings plc', exchange: 'NASDAQ' },
      { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing Co.', exchange: 'NYSE' },
      { symbol: 'ASML', name: 'ASML Holding N.V.', exchange: 'NASDAQ' },
      { symbol: 'AMAT', name: 'Applied Materials Inc.', exchange: 'NASDAQ' },
      { symbol: 'LRCX', name: 'Lam Research Corporation', exchange: 'NASDAQ' },
      { symbol: 'KLAC', name: 'KLA Corporation', exchange: 'NASDAQ' },
      { symbol: 'ADI', name: 'Analog Devices Inc.', exchange: 'NASDAQ' },
      { symbol: 'ON', name: 'ON Semiconductor Corporation', exchange: 'NASDAQ' },
      { symbol: 'QCOM', name: 'QUALCOMM Incorporated', exchange: 'NASDAQ' },
      { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ' },
      { symbol: 'SNDK', name: 'SanDisk Corporation', exchange: 'NASDAQ' },
      { symbol: 'WDC', name: 'Western Digital Corporation', exchange: 'NASDAQ' },
      { symbol: 'STX', name: 'Seagate Technology Holdings plc', exchange: 'NASDAQ' },
      { symbol: 'TXN', name: 'Texas Instruments Incorporated', exchange: 'NASDAQ' },
      { symbol: 'NXPI', name: 'NXP Semiconductors N.V.', exchange: 'NASDAQ' },
      { symbol: 'MCHP', name: 'Microchip Technology Incorporated', exchange: 'NASDAQ' },
      { symbol: 'MPWR', name: 'Monolithic Power Systems Inc.', exchange: 'NASDAQ' },
      { symbol: 'TER', name: 'Teradyne Inc.', exchange: 'NASDAQ' },
      { symbol: 'ENTG', name: 'Entegris Inc.', exchange: 'NASDAQ' },
      { symbol: 'SWKS', name: 'Skyworks Solutions Inc.', exchange: 'NASDAQ' },
      { symbol: 'QRVO', name: 'Qorvo Inc.', exchange: 'NASDAQ' },
      { symbol: 'ALAB', name: 'Astera Labs Inc.', exchange: 'NASDAQ' },
      { symbol: 'GFS', name: 'GlobalFoundries Inc.', exchange: 'NASDAQ' },
    ],
  },
  {
    id: 'memory',
    name: 'Memory / Storage',
    description:
      'Dedicated memory and storage scanner. Deliberately narrow — these four move as one and the spec wants them watched as their own group, with their own lower stage thresholds.',
    symbols: [
      { symbol: 'MU', name: 'Micron Technology Inc.', exchange: 'NASDAQ' },
      { symbol: 'SNDK', name: 'SanDisk Corporation', exchange: 'NASDAQ' },
      { symbol: 'WDC', name: 'Western Digital Corporation', exchange: 'NASDAQ' },
      { symbol: 'STX', name: 'Seagate Technology Holdings plc', exchange: 'NASDAQ' },
    ],
  },
  {
    id: 'ai-infrastructure',
    name: 'AI Infrastructure / Data Centers',
    description: 'Data centre REITs, GPU clouds, power management, cooling, optics and networking.',
    symbols: [
      { symbol: 'VRT', name: 'Vertiv Holdings Co', exchange: 'NYSE' },
      { symbol: 'ANET', name: 'Arista Networks Inc.', exchange: 'NYSE' },
      { symbol: 'SMCI', name: 'Super Micro Computer Inc.', exchange: 'NASDAQ' },
      { symbol: 'DELL', name: 'Dell Technologies Inc.', exchange: 'NYSE' },
      { symbol: 'HPE', name: 'Hewlett Packard Enterprise Co.', exchange: 'NYSE' },
      { symbol: 'CRDO', name: 'Credo Technology Group Holding Ltd.', exchange: 'NASDAQ' },
      { symbol: 'CLS', name: 'Celestica Inc.', exchange: 'NYSE' },
      { symbol: 'APLD', name: 'Applied Digital Corporation', exchange: 'NASDAQ' },
      { symbol: 'NBIS', name: 'Nebius Group N.V.', exchange: 'NASDAQ' },
      { symbol: 'EQIX', name: 'Equinix Inc.', exchange: 'NASDAQ' },
      { symbol: 'DLR', name: 'Digital Realty Trust Inc.', exchange: 'NYSE' },
      { symbol: 'CEG', name: 'Constellation Energy Corporation', exchange: 'NASDAQ' },
      { symbol: 'CRWV', name: 'CoreWeave Inc.', exchange: 'NASDAQ' },
      { symbol: 'CIEN', name: 'Ciena Corporation', exchange: 'NYSE' },
      { symbol: 'COHR', name: 'Coherent Corp.', exchange: 'NYSE' },
      { symbol: 'LITE', name: 'Lumentum Holdings Inc.', exchange: 'NASDAQ' },
      { symbol: 'PSTG', name: 'Pure Storage Inc.', exchange: 'NYSE' },
      { symbol: 'NTAP', name: 'NetApp Inc.', exchange: 'NASDAQ' },
    ],
  },
  {
    id: 'cloud-software',
    name: 'Cloud / Software / AI',
    description: 'Hyperscalers, enterprise software, data platforms and security.',
    symbols: [
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
      { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE' },
      { symbol: 'PLTR', name: 'Palantir Technologies Inc.', exchange: 'NASDAQ' },
      { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE' },
      { symbol: 'NOW', name: 'ServiceNow Inc.', exchange: 'NYSE' },
      { symbol: 'SNOW', name: 'Snowflake Inc.', exchange: 'NYSE' },
      { symbol: 'DDOG', name: 'Datadog Inc.', exchange: 'NASDAQ' },
      { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc.', exchange: 'NASDAQ' },
      { symbol: 'PANW', name: 'Palo Alto Networks Inc.', exchange: 'NASDAQ' },
      { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
      { symbol: 'INTU', name: 'Intuit Inc.', exchange: 'NASDAQ' },
      { symbol: 'IBM', name: 'International Business Machines Corp.', exchange: 'NYSE' },
      { symbol: 'NET', name: 'Cloudflare Inc.', exchange: 'NYSE' },
      { symbol: 'MDB', name: 'MongoDB Inc.', exchange: 'NASDAQ' },
      { symbol: 'ZS', name: 'Zscaler Inc.', exchange: 'NASDAQ' },
      { symbol: 'TEAM', name: 'Atlassian Corporation', exchange: 'NASDAQ' },
      { symbol: 'WDAY', name: 'Workday Inc.', exchange: 'NASDAQ' },
      { symbol: 'APP', name: 'AppLovin Corporation', exchange: 'NASDAQ' },
      { symbol: 'SHOP', name: 'Shopify Inc.', exchange: 'NASDAQ' },
    ],
  },
  {
    id: 'power-nuclear',
    name: 'Power / Nuclear / Energy Infrastructure',
    description: 'Independent power producers, nuclear, electrical equipment and utilities.',
    symbols: [
      { symbol: 'CEG', name: 'Constellation Energy Corporation', exchange: 'NASDAQ' },
      { symbol: 'VST', name: 'Vistra Corp.', exchange: 'NYSE' },
      { symbol: 'GEV', name: 'GE Vernova Inc.', exchange: 'NYSE' },
      { symbol: 'ETN', name: 'Eaton Corporation plc', exchange: 'NYSE' },
      { symbol: 'PWR', name: 'Quanta Services Inc.', exchange: 'NYSE' },
      { symbol: 'VRT', name: 'Vertiv Holdings Co', exchange: 'NYSE' },
      { symbol: 'NEE', name: 'NextEra Energy Inc.', exchange: 'NYSE' },
      { symbol: 'OKLO', name: 'Oklo Inc.', exchange: 'NYSE' },
      { symbol: 'SMR', name: 'NuScale Power Corporation', exchange: 'NYSE' },
      { symbol: 'CCJ', name: 'Cameco Corporation', exchange: 'NYSE' },
      { symbol: 'LEU', name: 'Centrus Energy Corp.', exchange: 'NYSE' },
      { symbol: 'TLN', name: 'Talen Energy Corporation', exchange: 'NASDAQ' },
      { symbol: 'NRG', name: 'NRG Energy Inc.', exchange: 'NYSE' },
      { symbol: 'SO', name: 'The Southern Company', exchange: 'NYSE' },
      { symbol: 'DUK', name: 'Duke Energy Corporation', exchange: 'NYSE' },
      { symbol: 'AES', name: 'The AES Corporation', exchange: 'NYSE' },
      { symbol: 'BWXT', name: 'BWX Technologies Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'oil-gas',
    name: 'Oil & Gas',
    description: 'Integrated majors, exploration and production, midstream and oilfield services.',
    symbols: [
      { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE' },
      { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE' },
      { symbol: 'COP', name: 'ConocoPhillips', exchange: 'NYSE' },
      { symbol: 'OXY', name: 'Occidental Petroleum Corporation', exchange: 'NYSE' },
      { symbol: 'EOG', name: 'EOG Resources Inc.', exchange: 'NYSE' },
      { symbol: 'SLB', name: 'Schlumberger N.V.', exchange: 'NYSE' },
      { symbol: 'HAL', name: 'Halliburton Company', exchange: 'NYSE' },
      { symbol: 'MPC', name: 'Marathon Petroleum Corporation', exchange: 'NYSE' },
      { symbol: 'PSX', name: 'Phillips 66', exchange: 'NYSE' },
      { symbol: 'VLO', name: 'Valero Energy Corporation', exchange: 'NYSE' },
      { symbol: 'LNG', name: 'Cheniere Energy Inc.', exchange: 'NYSE' },
      { symbol: 'DVN', name: 'Devon Energy Corporation', exchange: 'NYSE' },
      { symbol: 'FANG', name: 'Diamondback Energy Inc.', exchange: 'NASDAQ' },
      { symbol: 'HES', name: 'Hess Corporation', exchange: 'NYSE' },
      { symbol: 'BKR', name: 'Baker Hughes Company', exchange: 'NASDAQ' },
      { symbol: 'WMB', name: 'The Williams Companies Inc.', exchange: 'NYSE' },
      { symbol: 'KMI', name: 'Kinder Morgan Inc.', exchange: 'NYSE' },
      { symbol: 'OKE', name: 'ONEOK Inc.', exchange: 'NYSE' },
      { symbol: 'TRGP', name: 'Targa Resources Corp.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'biotech-pharma',
    name: 'Biotech / Pharma',
    description: 'Large-cap pharma, GLP-1 leaders and biotechnology innovators.',
    symbols: [
      { symbol: 'MRNA', name: 'Moderna Inc.', exchange: 'NASDAQ' },
      { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE' },
      { symbol: 'NVO', name: 'Novo Nordisk A/S', exchange: 'NYSE' },
      { symbol: 'REGN', name: 'Regeneron Pharmaceuticals Inc.', exchange: 'NASDAQ' },
      { symbol: 'VRTX', name: 'Vertex Pharmaceuticals Inc.', exchange: 'NASDAQ' },
      { symbol: 'GILD', name: 'Gilead Sciences Inc.', exchange: 'NASDAQ' },
      { symbol: 'AMGN', name: 'Amgen Inc.', exchange: 'NASDAQ' },
      { symbol: 'BIIB', name: 'Biogen Inc.', exchange: 'NASDAQ' },
      { symbol: 'BMY', name: 'Bristol-Myers Squibb Company', exchange: 'NYSE' },
      { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE' },
      { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
      { symbol: 'MRK', name: 'Merck & Co. Inc.', exchange: 'NYSE' },
      { symbol: 'ALNY', name: 'Alnylam Pharmaceuticals Inc.', exchange: 'NASDAQ' },
      { symbol: 'NBIX', name: 'Neurocrine Biosciences Inc.', exchange: 'NASDAQ' },
      { symbol: 'BNTX', name: 'BioNTech SE', exchange: 'NASDAQ' },
      { symbol: 'CRSP', name: 'CRISPR Therapeutics AG', exchange: 'NASDAQ' },
      { symbol: 'INCY', name: 'Incyte Corporation', exchange: 'NASDAQ' },
      { symbol: 'SRPT', name: 'Sarepta Therapeutics Inc.', exchange: 'NASDAQ' },
    ],
  },
  {
    id: 'financials',
    name: 'Financials',
    description: 'Investment banks, money centre banks, asset managers, exchanges and payments.',
    symbols: [
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
      { symbol: 'GS', name: 'The Goldman Sachs Group Inc.', exchange: 'NYSE' },
      { symbol: 'MS', name: 'Morgan Stanley', exchange: 'NYSE' },
      { symbol: 'BAC', name: 'Bank of America Corporation', exchange: 'NYSE' },
      { symbol: 'C', name: 'Citigroup Inc.', exchange: 'NYSE' },
      { symbol: 'WFC', name: 'Wells Fargo & Company', exchange: 'NYSE' },
      { symbol: 'BLK', name: 'BlackRock Inc.', exchange: 'NYSE' },
      { symbol: 'SCHW', name: 'The Charles Schwab Corporation', exchange: 'NYSE' },
      { symbol: 'COF', name: 'Capital One Financial Corporation', exchange: 'NYSE' },
      { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
      { symbol: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE' },
      { symbol: 'AXP', name: 'American Express Company', exchange: 'NYSE' },
      { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ' },
      { symbol: 'USB', name: 'U.S. Bancorp', exchange: 'NYSE' },
      { symbol: 'PNC', name: 'The PNC Financial Services Group Inc.', exchange: 'NYSE' },
      { symbol: 'CME', name: 'CME Group Inc.', exchange: 'NASDAQ' },
      { symbol: 'ICE', name: 'Intercontinental Exchange Inc.', exchange: 'NYSE' },
      { symbol: 'SPGI', name: 'S&P Global Inc.', exchange: 'NYSE' },
      { symbol: 'KKR', name: 'KKR & Co. Inc.', exchange: 'NYSE' },
      { symbol: 'BX', name: 'Blackstone Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'defense-aerospace',
    name: 'Defense / Aerospace',
    description: 'Defence primes, space technology, drones and advanced air mobility.',
    symbols: [
      { symbol: 'RTX', name: 'RTX Corporation', exchange: 'NYSE' },
      { symbol: 'LMT', name: 'Lockheed Martin Corporation', exchange: 'NYSE' },
      { symbol: 'NOC', name: 'Northrop Grumman Corporation', exchange: 'NYSE' },
      { symbol: 'GD', name: 'General Dynamics Corporation', exchange: 'NYSE' },
      { symbol: 'HII', name: 'Huntington Ingalls Industries Inc.', exchange: 'NYSE' },
      { symbol: 'LHX', name: 'L3Harris Technologies Inc.', exchange: 'NYSE' },
      { symbol: 'BA', name: 'The Boeing Company', exchange: 'NYSE' },
      { symbol: 'KTOS', name: 'Kratos Defense & Security Solutions Inc.', exchange: 'NASDAQ' },
      { symbol: 'AVAV', name: 'AeroVironment Inc.', exchange: 'NASDAQ' },
      { symbol: 'RKLB', name: 'Rocket Lab Corporation', exchange: 'NASDAQ' },
      { symbol: 'GE', name: 'GE Aerospace', exchange: 'NYSE' },
      { symbol: 'TDG', name: 'TransDigm Group Incorporated', exchange: 'NYSE' },
      { symbol: 'HWM', name: 'Howmet Aerospace Inc.', exchange: 'NYSE' },
      { symbol: 'LDOS', name: 'Leidos Holdings Inc.', exchange: 'NYSE' },
      { symbol: 'ASTS', name: 'AST SpaceMobile Inc.', exchange: 'NASDAQ' },
      { symbol: 'ACHR', name: 'Archer Aviation Inc.', exchange: 'NYSE' },
      { symbol: 'JOBY', name: 'Joby Aviation Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'ev-battery',
    name: 'EV / Battery / Clean Tech',
    description: 'Electric vehicle makers, lithium, battery technology, solar and quantum.',
    symbols: [
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
      { symbol: 'RIVN', name: 'Rivian Automotive Inc.', exchange: 'NASDAQ' },
      { symbol: 'LCID', name: 'Lucid Group Inc.', exchange: 'NASDAQ' },
      { symbol: 'NIO', name: 'NIO Inc.', exchange: 'NYSE' },
      { symbol: 'LI', name: 'Li Auto Inc.', exchange: 'NASDAQ' },
      { symbol: 'XPEV', name: 'XPeng Inc.', exchange: 'NYSE' },
      { symbol: 'ALB', name: 'Albemarle Corporation', exchange: 'NYSE' },
      { symbol: 'QS', name: 'QuantumScape Corporation', exchange: 'NYSE' },
      { symbol: 'ENVX', name: 'Enovix Corporation', exchange: 'NASDAQ' },
      { symbol: 'IONQ', name: 'IonQ Inc.', exchange: 'NYSE' },
      { symbol: 'F', name: 'Ford Motor Company', exchange: 'NYSE' },
      { symbol: 'GM', name: 'General Motors Company', exchange: 'NYSE' },
      { symbol: 'FSLR', name: 'First Solar Inc.', exchange: 'NASDAQ' },
      { symbol: 'ENPH', name: 'Enphase Energy Inc.', exchange: 'NASDAQ' },
      { symbol: 'PLUG', name: 'Plug Power Inc.', exchange: 'NASDAQ' },
      { symbol: 'LAC', name: 'Lithium Americas Corp.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'healthcare-devices',
    name: 'Healthcare / Medical Devices',
    description: 'Surgical robotics, devices, life-science tools, insurers and providers.',
    symbols: [
      { symbol: 'ISRG', name: 'Intuitive Surgical Inc.', exchange: 'NASDAQ' },
      { symbol: 'ABT', name: 'Abbott Laboratories', exchange: 'NYSE' },
      { symbol: 'SYK', name: 'Stryker Corporation', exchange: 'NYSE' },
      { symbol: 'BSX', name: 'Boston Scientific Corporation', exchange: 'NYSE' },
      { symbol: 'MDT', name: 'Medtronic plc', exchange: 'NYSE' },
      { symbol: 'DXCM', name: 'DexCom Inc.', exchange: 'NASDAQ' },
      { symbol: 'EW', name: 'Edwards Lifesciences Corporation', exchange: 'NYSE' },
      { symbol: 'HOLX', name: 'Hologic Inc.', exchange: 'NASDAQ' },
      { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', exchange: 'NYSE' },
      { symbol: 'DHR', name: 'Danaher Corporation', exchange: 'NYSE' },
      { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', exchange: 'NYSE' },
      { symbol: 'CI', name: 'The Cigna Group', exchange: 'NYSE' },
      { symbol: 'ELV', name: 'Elevance Health Inc.', exchange: 'NYSE' },
      { symbol: 'HCA', name: 'HCA Healthcare Inc.', exchange: 'NYSE' },
      { symbol: 'CVS', name: 'CVS Health Corporation', exchange: 'NYSE' },
      { symbol: 'RMD', name: 'ResMed Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'crypto-fintech',
    name: 'Crypto / Fintech',
    description:
      'Exchanges, miners, treasury-holders and consumer fintech. Moves as one bloc on bitcoin, which makes it a textbook breadth sector.',
    symbols: [
      { symbol: 'COIN', name: 'Coinbase Global Inc.', exchange: 'NASDAQ' },
      { symbol: 'MSTR', name: 'Strategy Inc.', exchange: 'NASDAQ' },
      { symbol: 'HOOD', name: 'Robinhood Markets Inc.', exchange: 'NASDAQ' },
      { symbol: 'MARA', name: 'MARA Holdings Inc.', exchange: 'NASDAQ' },
      { symbol: 'RIOT', name: 'Riot Platforms Inc.', exchange: 'NASDAQ' },
      { symbol: 'CLSK', name: 'CleanSpark Inc.', exchange: 'NASDAQ' },
      { symbol: 'CIFR', name: 'Cipher Mining Inc.', exchange: 'NASDAQ' },
      { symbol: 'IREN', name: 'IREN Limited', exchange: 'NASDAQ' },
      { symbol: 'WULF', name: 'TeraWulf Inc.', exchange: 'NASDAQ' },
      { symbol: 'CORZ', name: 'Core Scientific Inc.', exchange: 'NASDAQ' },
      { symbol: 'SOFI', name: 'SoFi Technologies Inc.', exchange: 'NASDAQ' },
      { symbol: 'AFRM', name: 'Affirm Holdings Inc.', exchange: 'NASDAQ' },
    ],
  },
  {
    id: 'retail-consumer',
    name: 'Retail / Consumer',
    description: 'Big-box retail, restaurants, apparel and discounters.',
    symbols: [
      { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE' },
      { symbol: 'COST', name: 'Costco Wholesale Corporation', exchange: 'NASDAQ' },
      { symbol: 'TGT', name: 'Target Corporation', exchange: 'NYSE' },
      { symbol: 'HD', name: 'The Home Depot Inc.', exchange: 'NYSE' },
      { symbol: 'LOW', name: "Lowe's Companies Inc.", exchange: 'NYSE' },
      { symbol: 'NKE', name: 'NIKE Inc.', exchange: 'NYSE' },
      { symbol: 'SBUX', name: 'Starbucks Corporation', exchange: 'NASDAQ' },
      { symbol: 'MCD', name: "McDonald's Corporation", exchange: 'NYSE' },
      { symbol: 'LULU', name: 'Lululemon Athletica Inc.', exchange: 'NASDAQ' },
      { symbol: 'CMG', name: 'Chipotle Mexican Grill Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'media-communications',
    name: 'Media / Communications',
    description: 'Streaming, telecom carriers, social platforms and audio.',
    symbols: [
      { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
      { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE' },
      { symbol: 'CMCSA', name: 'Comcast Corporation', exchange: 'NASDAQ' },
      { symbol: 'T', name: 'AT&T Inc.', exchange: 'NYSE' },
      { symbol: 'VZ', name: 'Verizon Communications Inc.', exchange: 'NYSE' },
      { symbol: 'TMUS', name: 'T-Mobile US Inc.', exchange: 'NASDAQ' },
      { symbol: 'SPOT', name: 'Spotify Technology S.A.', exchange: 'NYSE' },
      { symbol: 'RDDT', name: 'Reddit Inc.', exchange: 'NYSE' },
      { symbol: 'ROKU', name: 'Roku Inc.', exchange: 'NASDAQ' },
    ],
  },
  {
    id: 'industrials',
    name: 'Industrials / Transports',
    description: 'Machinery, freight, rails and diversified industrials.',
    symbols: [
      { symbol: 'CAT', name: 'Caterpillar Inc.', exchange: 'NYSE' },
      { symbol: 'DE', name: 'Deere & Company', exchange: 'NYSE' },
      { symbol: 'HON', name: 'Honeywell International Inc.', exchange: 'NASDAQ' },
      { symbol: 'UNP', name: 'Union Pacific Corporation', exchange: 'NYSE' },
      { symbol: 'UPS', name: 'United Parcel Service Inc.', exchange: 'NYSE' },
      { symbol: 'FDX', name: 'FedEx Corporation', exchange: 'NYSE' },
      { symbol: 'EMR', name: 'Emerson Electric Co.', exchange: 'NYSE' },
      { symbol: 'PH', name: 'Parker-Hannifin Corporation', exchange: 'NYSE' },
      { symbol: 'URI', name: 'United Rentals Inc.', exchange: 'NYSE' },
    ],
  },
  {
    id: 'travel-airlines',
    name: 'Travel / Airlines',
    description: 'Carriers, cruise lines, hotels and booking platforms.',
    symbols: [
      { symbol: 'DAL', name: 'Delta Air Lines Inc.', exchange: 'NYSE' },
      { symbol: 'UAL', name: 'United Airlines Holdings Inc.', exchange: 'NASDAQ' },
      { symbol: 'AAL', name: 'American Airlines Group Inc.', exchange: 'NASDAQ' },
      { symbol: 'LUV', name: 'Southwest Airlines Co.', exchange: 'NYSE' },
      { symbol: 'BKNG', name: 'Booking Holdings Inc.', exchange: 'NASDAQ' },
      { symbol: 'ABNB', name: 'Airbnb Inc.', exchange: 'NASDAQ' },
      { symbol: 'MAR', name: 'Marriott International Inc.', exchange: 'NASDAQ' },
      { symbol: 'RCL', name: 'Royal Caribbean Cruises Ltd.', exchange: 'NYSE' },
      { symbol: 'CCL', name: 'Carnival Corporation', exchange: 'NYSE' },
    ],
  },
  {
    id: 'metals-mining',
    name: 'Metals / Mining',
    description: 'Precious metals, copper, steel and critical minerals.',
    symbols: [
      { symbol: 'NEM', name: 'Newmont Corporation', exchange: 'NYSE' },
      { symbol: 'FCX', name: 'Freeport-McMoRan Inc.', exchange: 'NYSE' },
      { symbol: 'GOLD', name: 'Barrick Mining Corporation', exchange: 'NYSE' },
      { symbol: 'AEM', name: 'Agnico Eagle Mines Limited', exchange: 'NYSE' },
      { symbol: 'AA', name: 'Alcoa Corporation', exchange: 'NYSE' },
      { symbol: 'NUE', name: 'Nucor Corporation', exchange: 'NYSE' },
      { symbol: 'STLD', name: 'Steel Dynamics Inc.', exchange: 'NASDAQ' },
      { symbol: 'X', name: 'United States Steel Corporation', exchange: 'NYSE' },
      { symbol: 'CLF', name: 'Cleveland-Cliffs Inc.', exchange: 'NYSE' },
      { symbol: 'MP', name: 'MP Materials Corp.', exchange: 'NYSE' },
    ],
  },
];

/** Flattened, de-duplicated symbol list — what the worker subscribes to. */
export function seedSymbols(): string[] {
  const set = new Set<string>();
  for (const sector of SECTOR_SEED) {
    for (const s of sector.symbols) set.add(s.symbol);
  }
  return [...set].sort();
}

/** The seed expressed as the runtime Universe shape. */
export function seedUniverse(): Universe {
  const stockMap = new Map<string, UniverseStock>();
  const sectors: UniverseSector[] = SECTOR_SEED.map((sector) => {
    for (const s of sector.symbols) {
      if (!stockMap.has(s.symbol)) {
        stockMap.set(s.symbol, {
          symbol: s.symbol,
          name: s.name,
          exchange: s.exchange,
          active: true,
        });
      }
    }
    return {
      id: sector.id,
      name: sector.name,
      description: sector.description,
      active: true,
      constituents: sector.symbols.map((s) => ({ symbol: s.symbol, weight: s.weight ?? 1.0 })),
    };
  });

  return { sectors, stocks: [...stockMap.values()] };
}
