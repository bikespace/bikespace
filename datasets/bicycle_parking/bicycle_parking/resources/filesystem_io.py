from dagster import ConfigurableIOManager, InputContext, OutputContext
import geopandas as gpd

gpd.options.io_engine = "pyogrio"


def convert_dt_to_str(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    dt_cols = gdf.select_dtypes(
        include=["datetime", "datetime64[ms, UTC]"]).columns
    for col in dt_cols:
        gdf[col] = [dt.isoformat() for dt in gdf[col]]
    return gdf


class LocalIOManager(ConfigurableIOManager):
    # specifies an optional string list input, via config system
    path_prefix: list[str] = []

    def _get_path(self, context) -> str:
        return "/".join(self.path_prefix + context.asset_key.path)

    def handle_output(self, context: OutputContext, obj):
        output = None
        if isinstance(obj, gpd.GeoDataFrame):
            output = convert_dt_to_str(obj)
        else:
            output = obj
        with open(self._get_path(context) + ".geojson", "w") as f:
            f.write(output.to_json(na="drop", drop_id=True, indent=2))

    def load_input(self, context: InputContext):
        return gpd.read_file(self._get_path(context) + ".geojson")
