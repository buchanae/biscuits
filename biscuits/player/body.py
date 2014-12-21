from biscuits.geometry import Rectangle as BoundingBox
from biscuits.World import Body


class PlayerBody(Body):

    def __init__(self, player, world, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.player = player
        self.world = world

    def move(self, direction, distance=1):
        dx = direction.dx * distance
        dy = direction.dy * distance

        n = BoundingBox(self.x + dx, self.y + dy,
                        self.w, self.h)

        blocked = False

        collisions = self.world.query(n)

        for hit in collisions:
            hit.signals.player_collision.send(self.player)
            if hit.body.is_block:
                blocked = True

        if not blocked:
            self.set_from_rectangle(n)