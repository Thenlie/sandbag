import GradeScale, { findScoreRange, getAvgScore, GradeScales, ConversionGroups, Tuple, getRoundedScoreTuple } from '../GradeScale'
import routes from '../data/routes.json'
import { Route } from '.'
import { GradeBandTypes, routeScoreToBand } from '../GradeBands'

const POLISH_ARRAY = Array.from(new Set(routes.map((r) => r[GradeScales.POLISH])))

const polishGrade = '(?:(?:I|II|III|IV|V|VI)[+-]?|VI\\.[1-9]\\+?)'
const polishGradeRegex = new RegExp(`^(${polishGrade})(?:/(${polishGrade}))?$`)
const isPolish = (grade: string): RegExpMatchArray | null => grade.match(polishGradeRegex)

const getNextGrade = (grade: string): string | undefined => POLISH_ARRAY[POLISH_ARRAY.indexOf(grade) + 1]

const getScore = (grade: string): number | Tuple => {
  const parse = isPolish(grade)
  if (parse === null) {
    console.warn(`Unexpected grade format: ${grade} for grade scale Polish`)
    return -1
  }

  const basicGrade = parse[1]
  const slashGrade: string | undefined = parse[2]
  const basicScore = findScoreRange((r: Route) => r[GradeScales.POLISH] === basicGrade, routes)

  if (slashGrade === undefined) return basicScore

  if (getNextGrade(basicGrade) !== slashGrade) {
    console.warn(`Unexpected grade slash not subsequent: ${slashGrade}`)
    return -1
  }

  // VI.1/VI.1+
  const slashScore = findScoreRange((r: Route) => r[GradeScales.POLISH] === slashGrade, routes)
  return getRoundedScoreTuple(getAvgScore(basicScore), getAvgScore(slashScore))
}

// Kurtyka scale. Conversions based on the theCrag grade comparison chart:
// https://www.thecrag.com/en/article/grades
const Polish: GradeScale = {
  displayName: 'Polish Scale',
  name: GradeScales.POLISH,
  grades: POLISH_ARRAY,
  offset: 1000,
  conversionGroup: ConversionGroups.FREE,
  isType: (grade: string): boolean => isPolish(grade) !== null,
  getScore,
  getGrade: (score: number | Tuple): string => {
    const validateScore = (score: number): number => {
      const validScore = Number.isInteger(score) ? score : Math.ceil(score)
      return Math.min(Math.max(0, validScore), routes.length - 1)
    }

    if (typeof score === 'number') {
      return routes[validateScore(score)][GradeScales.POLISH]
    }

    const low: string = routes[validateScore(score[0])][GradeScales.POLISH]
    const high: string = routes[validateScore(score[1])][GradeScales.POLISH]
    if (low === high) return low
    return `${low}/${high}`
  },
  getGradeBand: (grade: string): GradeBandTypes => {
    const score = getScore(grade)
    return routeScoreToBand(getAvgScore(score))
  }
}

export default Polish
