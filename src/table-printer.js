/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

import Table from 'cli-table3';

/**
 * Wrapper class over `cli-table3` with default options preset.
 */
export default class TablePrinter extends Table {

  constructor(options) {
    super({
      ...options,
      style: {
        head: ['blue'],
        border: ['gray'],
      },
      chars: {
        'top': '-' ,
        'top-mid': '+' ,
        'top-left': '+' ,
        'top-right': '+',
        'bottom': '-' ,
        'bottom-mid': '+' ,
        'bottom-left': '+' ,
        'bottom-right': '+',
        'left': '|' ,
        'left-mid': '+' ,
        'mid': '-' ,
        'mid-mid': '+',
        'right': '|' ,
        'right-mid': '+' ,
        'middle': '│'
      }
    });
  }
}