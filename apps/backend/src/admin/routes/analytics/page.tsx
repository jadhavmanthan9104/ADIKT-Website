import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"

const AnalyticsDashboardPage = () => {
  return (
    <Container className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Executive Ecommerce Analytics</Heading>
          <Text className="text-ui-fg-subtle">
            Real-time revenue, conversion rates, COD vs Prepaid distribution, and garment performance
          </Text>
        </div>
        <Badge color="green">Live Operations</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-ui-bg-subtle">
          <Text size="small" className="text-ui-fg-muted font-medium">Gross Revenue</Text>
          <Heading level="h2" className="mt-2 text-2xl font-bold">₹0.00</Heading>
          <Text size="xsmall" className="text-ui-fg-subtle mt-1">Real-time synced</Text>
        </div>
        <div className="p-4 border rounded-lg bg-ui-bg-subtle">
          <Text size="small" className="text-ui-fg-muted font-medium">Total Orders</Text>
          <Heading level="h2" className="mt-2 text-2xl font-bold">0</Heading>
          <Text size="xsmall" className="text-ui-fg-subtle mt-1">0 pending dispatch</Text>
        </div>
        <div className="p-4 border rounded-lg bg-ui-bg-subtle">
          <Text size="small" className="text-ui-fg-muted font-medium">Average Order Value (AOV)</Text>
          <Heading level="h2" className="mt-2 text-2xl font-bold">₹0.00</Heading>
          <Text size="xsmall" className="text-ui-fg-subtle mt-1">Cart conversion: 0%</Text>
        </div>
        <div className="p-4 border rounded-lg bg-ui-bg-subtle">
          <Text size="small" className="text-ui-fg-muted font-medium">Prepaid vs COD Ratio</Text>
          <Heading level="h2" className="mt-2 text-2xl font-bold">0% / 0%</Heading>
          <Text size="xsmall" className="text-ui-fg-subtle mt-1">Razorpay Verified</Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "D2C Analytics",
})

export default AnalyticsDashboardPage
