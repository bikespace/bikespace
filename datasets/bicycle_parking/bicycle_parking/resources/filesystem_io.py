from dagster import ConfigurableIOManager, InputContext, OutputContext
import geopandas as gpd

gpd.options.io_engine = "pyogrio"


class LocalIOManager(ConfigurableIOManager):
    # specifies an optional string list input, via config system
    path_prefix: list[str] = []

    def _get_path(self, context) -> str:
        return "/".join(self.path_prefix + context.asset_key.path)

    def handle_output(self, context: OutputContext, obj):
        with open(self._get_path(context) + ".geojson", "w") as f:
            f.write(obj.to_json(na="drop", drop_id=True, indent=2))

    def load_input(self, context: InputContext):
        return gpd.read_file(self._get_path(context) + ".geojson")
