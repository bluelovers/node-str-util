/**
 * Created by user on 2017/12/24/024.
 *
 * this module only do the char is exists in jp, zht, zhs
 * so don't use this module when u wanna fully zht <=> zhs
 */

import * as self from './zh2jp';
import { split } from '../util';
import ZHJP_TABLE from './table';

export { ZHJP_TABLE };

export const KEY_JP = 'jp';
export const KEY_ZHT = 'zht';
export const KEY_ZHS = 'zhs';

let inited = false;
export let TABLE: {
	jp: ITABLE,
	zht: ITABLE,
	zhs: ITABLE,
};

export interface ITABLE
{
	[key: string]: ITABLESUB
}

export interface ITABLESUB
{
	jp: string,
	zht: string,
	zhs: string,
}

export function init(overwrite?: boolean)
{
	if (inited && !overwrite)
	{
		return;
	}

	// @ts-ignore
	TABLE = {};
	TABLE[KEY_JP] = {} as ITABLE;
	TABLE[KEY_ZHT] = {} as ITABLE;
	TABLE[KEY_ZHS] = {} as ITABLE;

	ZHJP_TABLE.forEach(function (vrow: string[])
	{
		let [jp, zht, zhs] = vrow;

		let k = KEY_JP;
		for (let c of jp)
		{
			if (TABLE[k][c])
			{
				continue;
			}

			TABLE[k][c] = TABLE[k][c] || {} as ITABLESUB;

			TABLE[k][c][k] = c;
			TABLE[k][c].zht = zht[0];
			TABLE[k][c].zhs = zhs[0];
		}

		k = KEY_ZHT;
		for (let c of zht)
		{
			if (TABLE[k][c])
			{
				continue;
			}

			TABLE[k][c] = TABLE[k][c] || {} as ITABLESUB;

			TABLE[k][c].jp = jp[0];
			TABLE[k][c][k] = c;
			TABLE[k][c].zhs = zhs[0];
		}

		k = KEY_ZHS;
		for (let c of zhs)
		{
			if (TABLE[k][c])
			{
				continue;
			}

			TABLE[k][c] = TABLE[k][c] || {} as ITABLESUB;

			TABLE[k][c].jp = jp[0];
			TABLE[k][c].zht = zht[0];
			TABLE[k][c][k] = c;
		}
	});

	return TABLE;
}

export function _getdata(char, from, to): string
{
	return (TABLE[from][char]) ? TABLE[from][char][to] : null;
}

/*
export function zht2jp(str)
{
	return split(str)
		.map(function (char: string)
		{
			let c: string;
			if (c = _getdata(char, KEY_ZHT, KEY_JP))
			{
				return c;
			}

			return char;
		})
		.join('')
		;
}
*/

namespace _
{
	init();

	let langs = Object.keys(TABLE);

	langs.forEach(function (from: string)
	{
		langs.forEach(function (to: string)
		{
			if (from == to) return;

			_[`${from}2${to}`] = function (str): string
			{
				if (!/[\u4E00-\u9FFF]+/.test(str.toString()))
				{
					return str;
				}

				return split(str)
					.map(function (char: string)
					{
						let c: string;
						if (c = _getdata(char, from, to))
						{
							return c;
						}

						return char;
					})
					.join('')
					;
			} as IFrom2To;
		});
	});
}

export interface IFrom2To extends Function
{
	(str, options?): string;
}

// @ts-ignore
export const jp2zht = _.jp2zht as IFrom2To;
// @ts-ignore
export const jp2zhs = _.jp2zhs as IFrom2To;
// @ts-ignore
export const zht2jp = _.zht2jp as IFrom2To;
// @ts-ignore
export const zht2zhs = _.zht2zhs as IFrom2To;
// @ts-ignore
export const zhs2jp = _.zhs2jp as IFrom2To;
// @ts-ignore
export const zhs2zht = _.zhs2zht as IFrom2To;

export function zh2jp(str, options?)
{
	if (!/[\u4E00-\u9FFF]+/.test(str.toString()))
	{
		return str;
	}

	return split(str)
		.map(function (char: string)
		{
			let c: string;
			if (c = _getdata(char, KEY_ZHT, KEY_JP))
			{
				return c;
			}
			else if (c = _getdata(char, KEY_ZHS, KEY_JP))
			{
				return c;
			}

			return char;
		})
		.join('')
		;
}

/*
import * as fs from 'fs-extra';
fs.outputJSON('./teachKanjiComparison.cache.json', TABLE, {
	spaces: "\t",
});

console.log(zhs2jp(1));

let t = '魔物解説　ランク等話　蚀蝕蝕王で触王 冒険者ギルド解説 蚀|蝕战|戦马|馬亚|亞國預中日漢字對照表'

console.log(zh2jp(t));
console.log(zht2jp(t));
console.log(zhs2jp(t));

console.log(zht2zhs(t));
console.log(zhs2zht(t));
*/

export default self;
//export default exports;