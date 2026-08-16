import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"

const ProductClothingWidget = ({ data }: { data: any }) => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Fashion & Garment Specifications</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            GSM, Fabric Weave, Fit Silhouette, and Size Chart Matrix
          </Text>
        </div>
        <Badge color="purple">ADIKT D2C</Badge>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-ui-fg-muted">Fabric Quality:</span>
          <p className="mt-1 font-semibold">{data?.metadata?.fabric || "100% Combed Compact Cotton"}</p>
        </div>
        <div>
          <span className="font-medium text-ui-fg-muted">Fabric Weight (GSM):</span>
          <p className="mt-1 font-semibold">{data?.metadata?.gsm || "280 GSM (Heavyweight)"}</p>
        </div>
        <div>
          <span className="font-medium text-ui-fg-muted">Fit Profile:</span>
          <p className="mt-1 font-semibold">{data?.metadata?.fit || "Oversized Boxy"}</p>
        </div>
        <div>
          <span className="font-medium text-ui-fg-muted">Origin / Craft:</span>
          <p className="mt-1 font-semibold">Crafted in India</p>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductClothingWidget
