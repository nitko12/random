import random

import pygame
from pygame.key import *
from pygame.locals import *
from pygame.color import *

import math
import pymunk
import pymunk.pygame_util

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
ANIM_LENGHT = 2
STICK = pygame.Color("#5c3a27")
STICK_LEN = 200


BALL_INFO = [
    # boja, bjela crta, broj, startna pozicija
    ["#ffd700", False, 1,
        (726 * 0.8, 274 - 50)
     ],
    ["#0000ff", False, 2,
        (783 * 0.8, 241 - 50)
     ],
    ["#ff0000", False, 3,
        (745 * 0.8, 264 - 50)
     ],
    ["#4b0082", False, 4,
        (783 * 0.8, 284 - 50)
     ],
    ["#ff4500", False, 5,
        (802 * 0.8, 274 - 50)
     ],
    ["#228b22", False, 6,
        (763 * 0.8, 296 - 50)
     ],
    ["#8b0000", False, 7,
        (802 * 0.8, 232 - 50)
     ],
    ["#000000", False, 8,
        (763 * 0.8, 274 - 50)
     ],
    ["#ffd700", True, 9,
        (783 * 0.8, 307 - 50)
     ],
    ["#0000ff", True, 10,
        (745 * 0.8, 284 - 50)
     ],
    ["#ff0000", True, 11,
        (802 * 0.8, 286 - 50)
     ],
    ["#4b0082", True, 12,
        (802 * 0.8, 252 - 50)
     ],
    ["#ff4500", True, 13,
        (763 * 0.8, 252 - 50)
     ],
    ["#228b22", True, 14,
        (802 * 0.8, 316 - 50)
     ],
    ["#8b0000", True, 15,
        (783 * 0.8, 264 - 50)
     ],
    ["#ffffff", True, None,
        (268 * 0.8, 274 - 50)]
]


class BouncyBalls(object):
    def __init__(self):
        self._space = pymunk.Space()
        self._space.gravity = (0.0, 0.0)
        self._space.damping = (0.7)
        self._dt = 1.0 / 60.0
        self._physics_steps_per_frame = 5
        pygame.init()
        pygame.font.init()
        self.myfont = pygame.font.SysFont('Comic Sans MS', 30)
        self._screen = pygame.display.set_mode((800, 600))
        self._clock = pygame.time.Clock()
        self._draw_options = pymunk.pygame_util.DrawOptions(self._screen)
        self.GAME_STATE = 0
        self._add_static_scenery()
        self._balls = []
        self.ANIM_PROGRESS = 0
        self._running = True
        self._ticks_to_next_ball = 10
        self.MOUSE_DRAG_LAST = (0, 0)
        self.MOUSE_END = (0, 0)
        self.rad = 0
        self.m = None
        self.img = pygame.image.load("board.jpg")
        self.imagerect = self.img.get_rect()
        self.score = (0, 0)
        self.striped = -1
        self.f = 1
        self.cur = 0
        self.black_next = [0, 0]
        self.potted = 0

    def init(self):
        for x in BALL_INFO:
            self._create_ball(x[3][0],  600 - x[3][1], x)

    def run(self):
        self.init()
        while self._running:
            for x in range(self._physics_steps_per_frame):
                self._space.step(self._dt / self._physics_steps_per_frame)
            self._process_events()
            self._clear_screen()
            self._draw_objects()
            pygame.display.flip()
            self._clock.tick(50)
            pygame.display.set_caption("fps: " + str(self._clock.get_fps()))

    def _add_static_scenery(self):
        static_body = self._space.static_body
        static_lines = [pymunk.Segment(static_body, (23.0, 600.0 - 10.0), (37.0, 600.0 - 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (37.0, 600.0 - 21.0), (383.0, 600.0 - 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (383.0, 600.0 - 21.0), (387.0, 600.0 - 10.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 23.0, 600.0 - 10.0), (800 - 37.0, 600.0 - 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 37.0, 600.0 - 21.0), (800 - 383.0, 600.0 - 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 383.0, 600.0 - 21.0), (800 - 387.0, 600.0 - 10.0), 0.0),
                        pymunk.Segment(
                            static_body, (23.0, 167.0 + 10.0), (37.0, 167.0 + 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (37.0, 167.0 + 21.0), (383.0, 167.0 + 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (383.0, 167.0 + 21.0), (387.0, 167.0 + 10.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 23.0, 167.0 + 10.0), (800 - 37.0, 167.0 + 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 37.0, 167.0 + 21.0), (800 - 383.0, 167.0 + 21.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 383.0, 167.0 + 21.0), (800 - 387.0, 167.0 + 10.0), 0.0),
                        pymunk.Segment(
                            static_body, (10.0, 600.0 - 21.0), (21.0, 600.0 - 37.0), 0.0),
                        pymunk.Segment(
                            static_body, (21.0, 167.0 + 37.0), (21.0, 600.0 - 37.0), 0.0),
                        pymunk.Segment(
                            static_body, (10.0, 167 + 21.0), (21.0, 167.0 + 37.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 10.0, 600.0 - 21.0), (800 - 21.0, 600.0 - 37.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 21.0, 167.0 + 37.0), (800 - 21.0, 600.0 - 37.0), 0.0),
                        pymunk.Segment(
                            static_body, (800 - 10.0, 167 + 21.0), (800 - 21.0, 167.0 + 37.0), 0.0)
                        ]
        for line in static_lines:
            line.elasticity = 0.85
            line.friction = 0.9
        self._space.add(static_lines)

    def in_circle(self, position):
        for x, y in [(12, 600 - 13), (400, 600 - 13), (789, 600 - 13), (13, 600 - 423), (402, 600 - 423), (788, 600 - 423)]:
            if math.hypot(position[0] - x, position[1] - y) < 15:
                return True
        return False

    def _process_events(self):
        for event in pygame.event.get():
            if event.type == QUIT:
                self._running = False
            elif event.type == KEYDOWN and event.key == K_ESCAPE:
                self._running = False
            elif event.type == KEYDOWN and event.key == K_w:
                self._balls[0].body.apply_impulse_at_local_point((0.0, 1000.0))
            elif event.type == KEYDOWN and event.key == K_a:
                self._balls[0].body.apply_impulse_at_local_point(
                    (-1000.0, 0.0))
            elif event.type == KEYDOWN and event.key == K_s:
                self._balls[0].body.apply_impulse_at_local_point(
                    (0.0, -1000.0))
            elif event.type == KEYDOWN and event.key == K_d:
                self._balls[0].body.apply_impulse_at_local_point((1000.0, 0.0))
            elif event.type == pygame.MOUSEBUTTONDOWN and self.GAME_STATE == 0:
                white = [i for i, v in enumerate(
                    self._balls) if v.body.s[2] == None]
                if len(white) == 0:
                    self.GAME_STATE = -1
                    return
                else:
                    white = white[0]
                self.GAME_STATE = 1
                self.MOUSE_DRAG_LAST = pygame.mouse.get_pos()
                print(self.MOUSE_DRAG_LAST)
                self.rad = math.atan2(((self._balls[white].body.position[0]) - (pygame.mouse.get_pos()[0])),
                                      ((600 - self._balls[white].body.position[1]) -
                                       (pygame.mouse.get_pos()[1]))) + math.pi
            elif event.type == pygame.MOUSEBUTTONUP and self.GAME_STATE == 1:
                self.GAME_STATE = 2
                self.ANIM_PROGRESS = 0
            elif event.type == pygame.MOUSEBUTTONDOWN and self.GAME_STATE == -2:
                self.GAME_STATE = -3
            elif event.type == pygame.MOUSEBUTTONUP and self.GAME_STATE == -3:
                mos = pygame.mouse.get_pos()
                self._create_ball(mos[0], 600 - mos[1], BALL_INFO[-1])
                self.GAME_STATE = 0
        balls_to_remove = [
            ball for ball in self._balls if self.in_circle(ball.body.position)]
        if 1 == len([ball for ball in self._balls if not ball.body.s[1]]):
            self.black_next[(self.striped + 1) % 2] = 1
        if 1 == len([ball for ball in self._balls if ball.body.s[1]]):
            self.black_next[self.striped] = 1
        for ball in balls_to_remove:
            if ball.body.s[0] != "#ffffff":
                if ball.body.s[1] and (self.striped == self.cur or self.striped == -1):
                    self.potted += 1
                if ball.body.s[0] and (self.striped != self.cur or self.striped == -1):
                    self.potted += 1
            if ball.body.s[0] == "#ffffff":
                self.GAME_STATE == -1
            elif self.f == 1:
                self.striped = self.cur
                self.f = 0
            if ball.body.s[0] == "#000000":
                if self.black_next[self.cur]:
                    won = self.cur
                else:
                    won = (self.cur + 1) % 2
                self._clear_screen()
                self._screen.blit(self.myfont.render(
                    "Player " + str(won) + " has won!", False, (0, 0, 0)), (200, 500))
                self._running = 0
            self._space.remove(ball, ball.body)
            self._balls.remove(ball)

    def _create_ball(self, x, y, info):
        mass = 1
        radius = 7
        inertia = pymunk.moment_for_circle(mass, 0, radius, (0, 0))
        body = pymunk.Body(mass, inertia)
        body.position = x, y
        shape = pymunk.Circle(body, radius, (0, 0))
        shape.elasticity = 0.95
        shape.friction = 0.9
        body.s = info
        self._space.add(body, shape)
        self._balls.append(shape)

    def _clear_screen(self):
        self._screen.fill(THECOLORS["white"])
        self._screen.blit(self.img, self.imagerect)

    def draw_score(self):
        self.score = (8 - len([ball for ball in self._balls if not ball.body.s[1]]),
                      8 - len([ball for ball in self._balls if ball.body.s[1]]))

        if self.striped == -1:
            textsurface = self.myfont.render(
                str(self.score[0]) + ", " + str(self.score[1]), False, (0, 0, 0))
        elif self.striped == 0:
            textsurface = self.myfont.render(
                "stripes: " + str(self.score[0]) + ", solids:" + str(self.score[1]), False, (0, 0, 0))
        elif self.striped == 1:
            textsurface = self.myfont.render(
                "solids: " + str(self.score[0]) + ", stripes:" + str(self.score[1]), False, (0, 0, 0))
        self._screen.blit(textsurface, (50, 450))
        if not self.f:
            self._screen.blit(self.myfont.render(
                "Player " + str(self.cur + 1) + " turn, striped player: " + str(self.striped + 1), False, (0, 0, 0)), (50, 500))
        else:
            self._screen.blit(self.myfont.render(
                "Player " + str(self.cur + 1) + " turn", False, (0, 0, 0)), (50, 500))

    def _draw_objects(self):
        # self._space.debug_draw(self._draw_options)
        for ball in self._balls:
            pygame.draw.circle(self._screen, pygame.Color(ball.body.s[0]), [
                int(ball.body.position[0]), 600 - int(ball.body.position[1])], 7)
            if ball.body.s[1]:
                pygame.draw.circle(self._screen, THECOLORS["white"], [
                    int(ball.body.position[0]), 600 - int(ball.body.position[1])], int(7 * 0.65))
        if self.GAME_STATE == 0:
            white = [i for i, v in enumerate(
                self._balls) if v.body.s[2] == None]
            if len(white) == 0:
                self.GAME_STATE = -1
                return
            else:
                white = white[0]
            self.rad = math.atan2(((self._balls[white].body.position[0]) - (pygame.mouse.get_pos()[0])),
                                  ((600 - self._balls[white].body.position[1]) -
                                   (pygame.mouse.get_pos()[1]))) + math.pi
            pygame.draw.line(
                self._screen, STICK,
                (self._balls[white].body.position[0] + math.sin(self.rad) * 7,
                 600 - self._balls[white].body.position[1] + math.cos(self.rad) * 7),
                (self._balls[white].body.position[0] + math.sin(self.rad) * (STICK_LEN + 7),
                 600 - self._balls[white].body.position[1] + math.cos(self.rad) * (STICK_LEN + 7)), 7)
        elif self.GAME_STATE == 1:
            white = [i for i, v in enumerate(
                self._balls) if v.body.s[2] == None]
            if len(white) == 0:
                self.GAME_STATE = -1
                return
            else:
                white = white[0]
            # asimptotska kretnja stapa
            self.m = pygame.mouse.get_pos()
            d = math.log(1 + math.hypot(
                (self.MOUSE_DRAG_LAST[0] - self.m[0]),
                (self.MOUSE_DRAG_LAST[1] - self.m[1]))) * 10
            pygame.draw.line(
                self._screen, STICK,
                (self._balls[white].body.position[0] + math.sin(self.rad) * (7 + d),
                 600 - self._balls[white].body.position[1] + math.cos(self.rad) * (7 + d)),
                (self._balls[white].body.position[0] + math.sin(self.rad) * (7 + STICK_LEN + d),
                 600 - self._balls[white].body.position[1] + math.cos(self.rad) * (STICK_LEN + 7 + d)), 7)
            MOUSE_END = self.m
        elif self.GAME_STATE == 2:
            if self.ANIM_PROGRESS > ANIM_LENGHT:
                # print(rad * 180 / math.pi)
                white = [i for i, v in enumerate(
                    self._balls) if v.body.s[2] == None]
                if len(white) == 0:
                    self.GAME_STATE = -1
                    return
                else:
                    white = white[0]

                fx = math.sin(self._balls[white].body._get_angle() - self.rad) * math.log(1 + math.hypot(
                    (self.MOUSE_DRAG_LAST[0] - self.m[0]),
                    (self.MOUSE_DRAG_LAST[1] - self.m[1])))

                fy = math.cos(self._balls[white].body._get_angle() - self.rad) * math.log(1 + math.hypot(
                    (self.MOUSE_DRAG_LAST[0] - self.m[0]),
                    (self.MOUSE_DRAG_LAST[1] - self.m[1])))

                self._balls[white].body.apply_impulse_at_local_point(
                    pymunk.Vec2d(fx, fy) * 500.0)

                self.GAME_STATE = 3
                self.potted = 0
                return
            d = ((ANIM_LENGHT - self.ANIM_PROGRESS) / ANIM_LENGHT) * math.log(1 + math.hypot(
                (self.MOUSE_DRAG_LAST[0] - self.m[0]),
                (self.MOUSE_DRAG_LAST[1] - self.m[1]))) * 10
            self.ANIM_PROGRESS += 1
            white = [i for i, v in enumerate(
                self._balls) if v.body.s[2] == None]
            if len(white) == 0:
                self.GAME_STATE = -1
                return
            else:
                white = white[0]
            pygame.draw.line(
                self._screen, STICK,
                (self._balls[white].body.position[0] + math.sin(self.rad) * (7 + d),
                 600 - self._balls[white].body.position[1] + math.cos(self.rad) * (7 + d)),
                (self._balls[white].body.position[0] + math.sin(self.rad) * (STICK_LEN + 7 + d),
                 600 - self._balls[white].body.position[1] + math.cos(self.rad) * (STICK_LEN + 7 + d)), 7)
        elif self.GAME_STATE == 3:
            stopped = 1
            for ball in self._balls:
                if abs(ball.body._get_velocity()[0]) < 1 and ball.body._get_velocity()[0] != 0:
                    ball.body._set_velocity((0, 0))
                if abs(ball.body._get_velocity()[1]) < 1 and ball.body._get_velocity()[1] != 0:
                    ball.body._set_velocity((0, 0))
                if abs(ball.body._get_velocity()[0]) > 1 or abs(ball.body._get_velocity()[1]) > 1:
                    stopped = 0
                    break
            if stopped:
                self.GAME_STATE = 0
                if self.potted == 0:
                    self.cur = (self.cur + 1) % 2
        elif self.GAME_STATE == -1:
            stopped = 1
            for ball in self._balls:
                if abs(ball.body._get_velocity()[0]) < 1 and ball.body._get_velocity()[0] != 0:
                    ball.body._set_velocity((0, 0))
                if abs(ball.body._get_velocity()[1]) < 1 and ball.body._get_velocity()[1] != 0:
                    ball.body._set_velocity((0, 0))
                if abs(ball.body._get_velocity()[0]) > 1 or abs(ball.body._get_velocity()[1]) > 1:
                    stopped = 0
                    break
            if stopped:
                self.GAME_STATE = -2
        elif self.GAME_STATE == -2:
            mos = pygame.mouse.get_pos()
            pygame.draw.circle(self._screen, pygame.Color(BALL_INFO[-1][0]), [
                int(mos[0]), int(mos[1])], 7)
        elif self.GAME_STATE == -3:
            mos = pygame.mouse.get_pos()
            pygame.draw.circle(self._screen, pygame.Color(BALL_INFO[-1][0]), [
                int(mos[0]), int(mos[1])], 7)
        self.draw_score()


if __name__ == '__main__':
    game = BouncyBalls()
    game.run()
