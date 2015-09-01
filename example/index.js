/**
 * Module Dependencies
 */

var m = require('multiline').stripIndent
var domify = require('domify')
var tip = require('..')

var html = domify(m(function() {/*
  <div id="links">
    <a href="#" title="top" id="top">Top</a>
    <a href="#" title="bottom" id="bottom">Bottom</a>
    <a href="#" title="left" id="left">Left</a>
    <a href="#" title="right this is very awesome cool story bro!" id="right">Right</a>
    <a href="#" title="top-left" id="top-left">Top Left</a>
    <a href="#" title="top-right" id="top-right">Top Right</a>
    <a href="#" title="bottom-left" id="bottom-left">Bottom Left</a>
    <a href="#" title="bottom-right" id="bottom-right">Bottom Right</a>
    <a href="#" tooltip="Hola mate!" tooltip-orientation="right" tooltip-class="simple" tooltip-offset="15 0">Hola</a>
  </div>
*/}))

document.body.appendChild(html)

/**
 * Test out the various positions
 */

;[
  '#top',
  '#bottom',
  '#left',
  '#right',
  '#top-left',
  '#top-right',
  '#bottom-left',
  '#bottom-right'
].forEach(function(id) {
  var el = document.querySelector(id)
  var pos = id.slice(1).split('-').join(' ')
  tip(el, {
    orientation: pos
  })
})

tip()
