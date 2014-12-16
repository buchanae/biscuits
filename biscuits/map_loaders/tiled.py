from kivy.core.image import Image
import pytmx

# TODO need a plugin system and graceful way to do this
from biscuits.geometry import Rectangle


class Region:

    def __init__(self, tile_layers, objects):
        self.tile_layers = tile_layers
        self.objects = objects


class RegionTileLayer:
    def __init__(self, x, y, tiles, width, height, tilewidth, tileheight):
        self.x = x
        self.y = y
        self.tiles = tiles
        self.width = width
        self.height = height
        self.tilewidth = tilewidth
        self.tileheight = tileheight


class Loadpoint:
    def __init__(self, ID, config, region):
        self.ID = ID
        self.config = config
        self.region = region


class TiledMap:

    def __init__(self, path):
        self._map = pytmx.TiledMap(filename=str(path),
                                   image_loader=KivyImageLoader)

        self.tilewidth = self._map.tilewidth
        self.tileheight = self._map.tileheight
        self.width = self._map.width
        self.height = self._map.height

        self.tile_layers = self._load_tile_layers()
        self.objects = self._load_objects()
        self.regions = self._load_regions()
        self.loadpoints = self._load_loadpoints()

    def _iter_layers(self, indices):
        return (self._map.layers[i] for i in indices)

    def _load_loadpoints(self):
        loadpoints = {}

        for region in self.regions:
            for obj in region.objects:
                if obj.type == 'Loadpoint':
                    loadpoints[obj.name] = Loadpoint(obj.name, obj, region)

        return loadpoints
                

    # TODO this could be majorly optimized with some smart data structures
    #      but for now it's easy
    def _load_regions(self):
        regions = []

        for obj in self.objects:
            if obj.type == 'Region':
                objects = self._load_objects_in_region(obj)
                tile_layers = self._load_tile_layers_in_region(obj)
                region = Region(tile_layers, objects)
                regions.append(region)

        return regions

    def _load_objects_in_region(self, region):
        objects = []
        rect = region.rectangle

        for obj in self.objects:
            if obj.type != 'Region' and obj.rectangle.overlaps(rect):
                objects.append(obj)

        return objects

    def _load_tile_layers_in_region(self, region):
        layers = []
        rect = region.rectangle

        for layer in self.tile_layers:
            tiles = []

            for tile in layer.tiles():
                x, y, image = tile
                y = self.height - y - 1
                tile_rect = Rectangle(x, y, 1, 1)

                if tile_rect.overlaps(rect):
                    tiles.append(tile)

            if tiles:
                r = RegionTileLayer(x, y, tiles, int(region.width), int(region.height),
                                    self.tilewidth, self.tileheight)
                layers.append(r)

        return layers


    def _load_tile_layers(self):
        return list(self._iter_layers(self._map.visible_tile_layers))

    def _load_objects(self):
        tile_w = self._map.tilewidth
        tile_h = self._map.tileheight

        objects = []

        for group in self._iter_layers(self._map.visible_object_groups):
            for obj in group:

                obj.width = obj.width / tile_w
                obj.height = obj.height / tile_h

                obj.x = obj.x / tile_w
                obj.y = self._map.height - (obj.y / tile_w) - obj.height
                obj.rectangle = Rectangle(obj.x, obj.y, obj.width, obj.height)

                self.visit(obj)
                objects.append(obj)

        return objects

    def visit(self, obj):
        try:
            method = getattr(self, 'handle_' + obj.type)
            method(obj)
        except AttributeError:
            pass

    def handle_Coin(self, obj):
        obj.coin_value = int(getattr(obj, 'coinValue', 1))

    def handle_CoinChest(self, obj):
        obj.coin_value = int(getattr(obj, 'coinValue', 1))


class KivyImageLoader:
    """
    Loads Kivy images. Make sure that there is an active OpenGL context
    (Kivy Window) before trying to load a map.
    """

    def __init__(self, filename, colorkey):
        self._texture = Image(filename).texture

    def __call__(self, rect, flags):

        # Kivy uses a window coordinate system: origin is bottom/left,
        # and regions are sliced from bottom/left to top/right.
        #
        # Tiled has a different coordinate system: the y-axis is flipped,
        # origin is top/right, and regions are sliced from top/left to
        # bottom/right.
        #
        # So, we need to transform the y-coordinate.
        x, y, w, h = rect
        y = self._texture.height - y - h
        return self._texture.get_region(x, y, w, h)