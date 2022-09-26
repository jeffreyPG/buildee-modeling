import React from 'react'
import ReactFC from 'react-fusioncharts'
import FusionCharts from 'fusioncharts'
import StackedColumn2d from 'fusioncharts/fusioncharts.charts'
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion'

FusionCharts.options.license({
  key:
    'nA-16C5C-11coI3A1A7B1A6C7F6C4G4F4H2A2B2lF-11wE1G4xI-7lrgA3B4vbsH3B5D7C2B1F1D1B4D4E3B1C8E6C2A1E2juwB3B7D1F-11D1D3G4rqb1B9D2C6njyD3H4A9bzfE3D4A2I4E1A9B3D7E2B2G2yqsC2B2ZC7egvH4I3B8oD-13B5QD5D3jteD5B5B2E5B4E4F3H2B8A5E4E4A3D1B-8==',
  creditLabel: false
})

ReactFC.fcRoot(FusionCharts, StackedColumn2d, FusionTheme)

const defaultChartConfigs = {
  type: 'stackedcolumn2d',
  width: '100%',
  height: '400',
  dataFormat: 'json'
}

const getChartConfig = ({ chartConfig, categories, dataset }) => {
  return {
    ...defaultChartConfigs,
    dataSource: {
      chart: chartConfig,
      categories: categories,
      dataset: dataset
    }
  }
}

export default function StackedChart({ chartConfig, categories, dataset }) {
  return <ReactFC {...getChartConfig({ chartConfig, categories, dataset })} />
}
