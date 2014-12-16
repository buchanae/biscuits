from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class Jar(Base):

    def __init__(self, rectangle):
        super().__init__()

        # TODO resolve this tile width/height crap
        self.widget = BasicWidget(pos=(rectangle.x * 32, rectangle.y * 32),
                                  size=(32, 32))
        self.widget.color.rgb = (.5, .25, 0)
        self.body = Body(*rectangle, is_block=True)

        self.signals.attack.connect(self.destroy)

    @classmethod
    def from_config(cls, config):
        return cls(config.rectangle)