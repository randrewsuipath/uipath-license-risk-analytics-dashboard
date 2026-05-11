# UiPath License Risk Analytics Dashboard
A professional enterprise license utilization risk analytics platform for UiPath customer success teams.
## Features
- **Executive Summary**: Portfolio-wide metrics including active accounts, consumption totals, risk counts, and expiring licenses
- **Account Risk Scoring**: Automated risk calculation based on under-utilization against expected monthly consumption rates
- **Product-Specific Thresholds**: Robot products (35% baseline) and other consumables (70% baseline)
- **Filtering & Search**: Filter by account director, TAM, CSM, product, risk level, and search by name/ID
- **Account Detail Views**: Drill-down into individual accounts with current usage cards, historical charts, and risk analysis
- **Historical Tracking**: View consumption trends over time with interactive charts
- **Secure Backend Proxy**: Never exposes UiPath credentials to the browser
- **Mock Data Mode**: Develop and test without UiPath Data Service credentials
## Architecture
### Backend (Node.js/Express)
- Secure proxy to UiPath Data Service
- Risk scoring algorithm
- Data aggregation and normalization
- RESTful API endpoints
### Frontend (React/TypeScript)
- Professional enterprise UI with shadcn components
- Recharts for data visualization
- Responsive design for desktop and tablet
## Setup Instructions
### Prerequisites
- Node.js 18+ and npm
- UiPath Data Service access (optional for mock mode)
### Installation
1. Clone the repository and install dependencies:
```bash
npm install
```
2. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```
3. Configure environment variables:
**For mock data mode (no UiPath credentials needed):**
```env
USE_MOCK_DATA=true
DEFAULT_SNAPSHOT_MONTH=2024-01
PORT=3001
VITE_API_BASE_URL=http://localhost:3001/api
```
**For production mode (requires UiPath credentials):**
```env
UIPATH_DATA_SERVICE_BASE_URL=https://cloud.uipath.com/{orgName}/{tenantName}/dataservice_
UIPATH_ACCESS_TOKEN=your_access_token_here
USE_MOCK_DATA=false
DEFAULT_SNAPSHOT_MONTH=2024-01
PORT=3001
VITE_API_BASE_URL=http://localhost:3001/api
```
### Running the Application
**Development mode (both frontend and backend):**
```bash
npm run dev:all
```
**Frontend only:**
```bash
npm run dev
```
**Backend only:**
```bash
npm run dev:server
```
The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001`.
## API Endpoints
- `GET /api/snapshot-months` - Get available snapshot months
- `GET /api/dashboard?month=YYYY-MM` - Get dashboard summary metrics
- `GET /api/accounts?month=YYYY-MM` - Get account list
- `GET /api/accounts/:subsidiaryId?month=YYYY-MM` - Get account detail
- `GET /api/accounts/:subsidiaryId/history` - Get account historical data
- `GET /api/metric-map` - Get license metric mappings
- `GET /api/snapshot-runs` - Get snapshot run details
- `GET /api/health` - Health check endpoint
## Data Service Entities
The application integrates with the following UiPath Data Service entities:
- **LicenseAccount**: Account metadata (subsidiaryId, name, account director, TAM, CSM, region)
- **LicenseSnapshotRun**: Snapshot execution metadata (timestamp, month, status, row counts)
- **LicenseMetricMap**: Product-to-metric mappings (licensed product, primary usage metric, display settings)
- **AccountLicenseConsumptionSnapshot**: Point-in-time consumption data (products, quantities, consumption, expiry dates)
## Risk Scoring Algorithm
### Calculation
For each product in an account:
1. **Monthly Expected Rate** = `licensedProductQty / monthsRemaining`
2. **Utilization Rate** = `consumed / monthlyExpectedRate`
3. **Utilization Percentage** = `utilizationRate * 100`
### Thresholds
**Robot Products** (Robot Units, Unattended Robot, Test Robot):
- High risk: < 15%
- Medium risk: < 25%
- Low risk: < 35%
- No risk: >= 35%
**Other Consumables** (AI Units, Agentic Units, DU Units, Platform Units):
- High risk: < 30%
- Medium risk: < 50%
- Low risk: < 70%
- No risk: >= 70%
### Scoring
- High utilization risk: +60 points
- Medium utilization risk: +35 points
- Low utilization risk: +15 points
- Multiple products at risk (2+): +10 points
- Missing TAM/CSM (when at risk): +10 points
- Maximum score: 100
### Risk Levels
- **Critical**: Score >= 80
- **High**: Score >= 60
- **Medium**: Score >= 35
- **Low**: Score >= 15
- **None**: Score < 15
## Development Notes
- Telemetry data is displayed for informational purposes only and does not affect risk scoring
- Expired licenses are flagged separately and not treated as under-utilization risk
- Licenses expiring within 30 days add a warning reason but do not increase risk score unless utilization is below threshold
- High utilization or over-consumption does not add risk (only under-utilization is a concern)
## License
Proprietary - UiPath Internal Use Only