# Keyword exports

Raw Semrush exports (US). Use these to find new guides: filter a file for commercial "best X" terms with no page yet, check `grep -rlF '"<keyword>"' src/pages`, then add a row to `../seed-keywords.csv` with `keyword_file` pointing here.

- `best-<slug>.csv`: the export behind one seed row (all keywords for that product).
- `niche-<name>.csv`: broad niche exports ("best air…", "best gas…", "best cordless…", "best generator…", water filters, water heaters). These are the main source for future gaps.
- `bing-power-stations*.csv`: Bing Webmaster keyword research exports.
- Bing Webmaster performance reports for the site are in `../bing/` and `../bing-keyword-report-*.csv`; the daily API pull writes `content/analytics/bing-*`.

| File | Keywords | Top keyword (volume) |
|---|---|---|
| best-air-mattress.csv | 2188 | best air mattress (9900) |
| best-battery-maintainer.csv | 7384 | battery charger (60500) |
| best-camping-power-bank.csv | 6878 | bank of america near me (823000) |
| best-car-jump-starter.csv | 18367 | how to jump start a car (74000) |
| best-cheap-portable-power-station.csv | 2493 | best portable power stations (110000) |
| best-cordless-car-vacuum.csv | 2049 | best car vacuums (90500) |
| best-dji-power-station.csv | 539 | portable power station (60500) |
| best-furnace-filter.csv | 573 | best furnace air filter (590) |
| best-gas-snow-blower.csv | 5457 | snow blower (165000) |
| best-handheld-vacuum.csv | 4394 | best car vacuums (90500) |
| best-heat-tape-for-pipes.csv | 1359 | heat tape (18100) |
| best-heated-driveway-mat.csv | 925 | heat track mats (3600) |
| best-hot-water-recirculating-pump.csv | 1984 | hot water circulation pump (8100) |
| best-kerosene-heater.csv | 176 | best kerosene heater for indoor use (2400) |
| best-outdoor-faucet-cover.csv | 993 | faucet cover (8100) |
| best-ozone-generator.csv | 1200 | ozone machine (74000) |
| best-pipe-insulation.csv | 18147 | insulation pipe insulation (22200) |
| best-roof-rake.csv | 3820 | roof rake (18100) |
| best-smart-thermostat.csv | 24944 | smart thermostat (1220000) |
| best-window-insulation-kit.csv | 1949 | window insulation kit (12100) |
| bing-power-stations-2026-11-21.csv | 39 | best portable power stations (124775) |
| bing-power-stations-brands-2026-11-21.csv | 121 | printables (417800) |
| niche-air.csv | 30003 | air purifier (201000) |
| niche-cordless.csv | 25341 | best cordless drills (110000) |
| niche-gas-phrase.csv | 30003 | best gas prices near me (14800) |
| niche-gas.csv | 30003 | best camping cookware (135000) |
| niche-generator.csv | 30003 | generator (201000) |
| niche-water-filters.csv | 30003 | reverse osmosis water filter (165000) |
| niche-water-heaters.csv | 30003 | water (368000) |
