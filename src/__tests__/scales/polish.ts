import { GradeBands } from '../../GradeBands'
import { Polish } from '../../scales'

describe('Polish', () => {
  describe('Get Score', () => {
    [
      ['II', 'I'],
      ['VI.1', 'VI+'],
      ['VI.2', 'VI.1+'],
      ['VI.9+', 'VI.9']
    ].forEach((t) => {
      test(`${t[0]} > ${t[1]}`, () => {
        const lowGrade = Polish.getScore(t[1])
        const highGrade = Polish.getScore(t[0])
        expect(highGrade[0]).toBeGreaterThan(lowGrade[1])
      })
    })

    test('Slash grade provided', () => {
      expect(Polish.getScore('VI.1/VI.1+')).toStrictEqual([65, 66])
      expect(Polish.getScore('VI/VI+')).toStrictEqual([60, 62])
    })
  })

  describe('Invalid grade format', () => {
    jest.spyOn(console, 'warn').mockImplementation()
    beforeEach(() => {
      jest.clearAllMocks()
    })
    test.each(['VII', 'VI.0', 'VI.10', 'V.1', 'VI.1++', '6a', 'VI.1/VI.2/VI.3'])('invalid grade %s', (grade) => {
      expect(Polish.isType(grade)).toBe(false)
      expect(Polish.getScore(grade)).toEqual(-1)
      expect(console.warn).toHaveBeenCalledWith(
        `Unexpected grade format: ${grade} for grade scale Polish`
      )
    })
    test('next grade not subsequent', () => {
      expect(Polish.getScore('VI.1/VI.2')).toEqual(-1)
      expect(console.warn).toHaveBeenCalledWith(
        'Unexpected grade slash not subsequent: VI.2'
      )
    })
  })

  describe('Get Grade', () => {
    test('bottom of scale', () => {
      expect(Polish.getGrade(0)).toEqual('I-')
      expect(Polish.getGrade(-5)).toEqual('I-')
    })
    test('top of scale', () => {
      expect(Polish.getGrade(1000)).toEqual('VI.9+')
    })
    test('single score', () => {
      expect(Polish.getGrade(64)).toEqual('VI.1')
    })
    test('score tuple', () => {
      expect(Polish.getGrade([65, 66])).toEqual('VI.1/VI.1+')
      expect(Polish.getGrade([64, 65])).toEqual('VI.1')
    })
    test('round trip', () => {
      Polish.grades.forEach((g) => {
        expect(Polish.getGrade(Polish.getScore(g))).toEqual(g)
      })
    })
  })

  describe('Get Grade Band', () => {
    test('beginner', () => expect(Polish.getGradeBand('III')).toEqual(GradeBands.BEGINNER))
    test('intermediate', () => expect(Polish.getGradeBand('VI')).toEqual(GradeBands.INTERMEDIATE))
    test('advanced', () => expect(Polish.getGradeBand('VI.3')).toEqual(GradeBands.ADVANCED))
    test('expert', () => expect(Polish.getGradeBand('VI.6')).toEqual(GradeBands.EXPERT))
  })
})
