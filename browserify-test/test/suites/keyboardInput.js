import {Injector} from 'di';
import {Input, KeyboardInput} from 'src/input';
import {KeyEventsHelper} from 'test/utils/KeyEventsHelper';

var injector = new Injector();
var helper = KeyEventsHelper(document);

injector.get(KeyboardInput);
var input = injector.get(Input);

var keys = [
  ['Up', 38],
  ['Down', 40],
  ['Left', 37],
  ['Right', 39],
  ['Use', 69],
  ['Sword', 70],
];

for (var i = 0; i < keys.length; i++) {
  var name = keys[i][0];
  var code = keys[i][1];

  helper.keydown(code);
  assert(input[name]);
  helper.keyup(code);
  assert(!input[name]);
}