import { model } from "@medusajs/framework/utils"

export const ClothingSpec = model.define("clothing_spec", {
  id: model.id().primaryKey(),
  fabric: model.text(),
  gsm: model.number(),
  weave_type: model.text().nullable(),
  material_details: model.text(),
  fit: model.text(),
  print_technique: model.text().nullable(),
  wash_care_instructions: model.array(),
  wash_care_symbols: model.array().nullable(),
  model_info: model.json().nullable(),
  size_chart: model.json(),
  measurements_guide_image_url: model.text().nullable(),
})
