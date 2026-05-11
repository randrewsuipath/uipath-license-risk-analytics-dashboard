# UiPath License Risk Analytics Dashboard

A professional enterprise license utilization risk analytics platform for UiPath customer success teams. This dashboard provides comprehensive visibility into account-level license consumption patterns, risk scoring, and portfolio health metrics with secure backend proxy architecture.

[cloudflarebutton]

## Overview

The UiPath License Risk Analytics Dashboard aggregates data from UiPath Data Service entities to deliver actionable insights into license utilization across your organization. Built with a secure backend proxy that never exposes UiPath credentials to the browser, the application features executive summary cards, advanced filtering, top-risk account identification, sortable account tables with drill-down capabilities, detailed account views with historical usage charts, risk distribution analysis, and license expiry tracking.

## Key Features

- **Executive Summary Dashboard** - Portfolio-wide metrics including active accounts, total consumption, and risk counts
- **Advanced Filtering** - Filter by account director, TAM, CSM, licensed product, risk level, and search
- **Risk Scoring Algorithm** - Product-specific utilization thresholds (robot products: 35% baseline, other consumables: 70% baseline)
- **Top Risk Identification** - Visual cards highlighting the 5 highest-risk accounts requiring immediate attention
- **Account Drill-Down** - Detailed views with current usage cards, historical charts, and risk breakdowns
- **Historical Analytics** - Track license consumption trends over time with interactive charts
- **Secure Architecture** - Backend proxy handles all UiPath authentication, tokens never exposed to browser
- **Mock Data Mode** - Development mode with realistic sample data when credentials are unavailable
- **Responsive Design** - Professional UiPath enterprise design standards with desktop and tablet support

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS v4** for modern utility-first styling
- **shadcn/ui** component library built on Radix UI primitives
- **Recharts** for data visualization and analytics charts
- **Zustand** for lightweight state management
- **React Router** for client-side routing
- **Lucide React** for consistent iconography

### Backend & Infrastructure
- **Cloudflare Pages** for global edge deployment
- **UiPath TypeScript SDK** for Data Service integration
- **Environment-based configuration** for secure credential management

### Development Tools
- **Bun** runtime and package manager
- **TypeScript 5.8** for static type checking
- **ESLint** with TypeScript support for code quality
- **PostCSS** with Tailwind for CSS processing

## Prerequisites

- **Bun** v1.0 or higher ([installation guide](https://bun.sh/docs/installation))
- **UiPath Cloud Account** with appropriate permissions
- **UiPath OAuth Application** configured with required scopes

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd uipath-license-risk-dashboard
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment variables**

Copy the `.env` file and update with your UiPath credentials:

```bash
cp .env .env.local
```

Edit `.env.local` with your UiPath configuration:

```env
VITE_UIPATH_BASE_URL=https://api.uipath.com
VITE_UIPATH_ORG_NAME=your-org-name
VITE_UIPATH_TENANT_NAME=your-tenant-name
VITE_UIPATH_CLIENT_ID=your-client-id
VITE_UIPATH_REDIRECT_URI=http://localhost:3000
VITE_UIPATH_SCOPE=OR.Administration.Read OR.Assets.Read OR.Execution.Read OR.Folders OR.Jobs OR.Queues.Read OR.Tasks PIMS Traces.Api DataFabric.Data.Read DataFabric.Data.Write DataFabric.Schema.Read
```

**Required OAuth Scopes:**
- `DataFabric.Schema.Read` - Read entity schemas
- `DataFabric.Data.Read` - Read license data from Data Service
- `OR.Execution.Read` - Read process execution data
- `OR.Folders` - Access folder information

4. **Start development server**

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

### Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build production bundle
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint for code quality checks

### Mock Data Mode

For development without UiPath credentials, the application supports mock data mode. Set `USE_MOCK_DATA=true` in your environment variables to use realistic sample data with:

- 8 sample accounts
- 4 snapshot months
- Multiple product types (AI Units, Agentic Units, DU Units, Platform Units, Robot Units)
- Varied expiry dates and utilization levels
- Mixed TAM/CSM/accountDirector completeness

### Adding New Features

1. **Create components** in `src/components/` following the existing patterns
2. **Use TypeScript types** from `src/types/entities.ts` for all Data Service entities
3. **Follow the risk scoring utility** in `src/lib/riskScoring.ts` for consistent calculations
4. **Leverage existing UI components** from `src/components/ui/` (shadcn/ui)
5. **Test with mock data** before integrating with live Data Service

## Data Service Entities

The application integrates with the following UiPath Data Service entities:

### LicenseAccount
Account-level metadata including subsidiaryId, subsidiaryName, accountDirector, TAM, CSM, region, and activity status.

### LicenseSnapshotRun
Snapshot execution metadata with timestamps, source information, row counts, and processing status.

### LicenseMetricMap
Product-to-metric mappings defining which consumption metric to use for each licensed product.

### AccountLicenseConsumptionSnapshot
Point-in-time consumption data per account and product, including licensed quantities, consumed units, expiry dates, and telemetry flags.

## Risk Scoring Algorithm

The dashboard implements a sophisticated risk scoring algorithm based on under-utilization against expected monthly consumption rates:

### Calculation Method

1. **Monthly Expected Rate** = licensedProductQty / monthsRemaining
2. **Utilization Rate** = consumed / monthlyExpectedRate
3. **Utilization Percentage** = utilizationRate × 100

### Product-Specific Thresholds

**Robot Products** (35% baseline):
- High risk: < 15% utilization
- Medium risk: < 25% utilization
- Low risk: < 35% utilization
- No risk: ≥ 35% utilization

**Other Consumables** (70% baseline):
- High risk: < 30% utilization
- Medium risk: < 50% utilization
- Low risk: < 70% utilization
- No risk: ≥ 70% utilization

### Risk Levels

- **Critical**: Score ≥ 80
- **High**: Score ≥ 60
- **Medium**: Score ≥ 35
- **Low**: Score ≥ 15
- **None**: Score < 15

**Note**: Missing telemetry does NOT affect risk scores. High utilization or over-consumption is NOT penalized.

## Deployment

### Cloudflare Pages

[cloudflarebutton]

The application is designed for deployment on Cloudflare Pages with automatic builds and global edge distribution.

#### Manual Deployment

1. **Build the application**

```bash
bun run build
```

2. **Deploy to Cloudflare Pages**

```bash
npx wrangler pages deploy dist
```

3. **Configure environment variables** in Cloudflare Pages dashboard:

Navigate to your Pages project → Settings → Environment variables and add:

```
VITE_UIPATH_BASE_URL
VITE_UIPATH_ORG_NAME
VITE_UIPATH_TENANT_NAME
VITE_UIPATH_CLIENT_ID
VITE_UIPATH_REDIRECT_URI
VITE_UIPATH_SCOPE
```

#### Automatic Deployment

Connect your repository to Cloudflare Pages for automatic deployments on every push:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Pages → Create a project
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Add environment variables
6. Deploy

### OAuth Redirect URI

After deployment, update your UiPath OAuth application with the production redirect URI:

```
https://your-app.pages.dev
```

And update the `VITE_UIPATH_REDIRECT_URI` environment variable in Cloudflare Pages settings.

## Security Considerations

- **Never commit credentials** - All sensitive data should be in environment variables
- **Backend proxy pattern** - UiPath tokens are never exposed to the browser
- **OAuth flow** - Secure authentication via UiPath's OAuth 2.0 implementation
- **Environment-based config** - Different credentials for development, staging, and production
- **Token refresh** - Automatic token refresh handled by the UiPath SDK

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

Built with ❤️ using UiPath TypeScript SDK and Cloudflare Pages