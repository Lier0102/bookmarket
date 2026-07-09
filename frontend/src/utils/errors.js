export function getErrorMessage(err) {
  if (!err) return '알 수 없는 오류가 발생했습니다.'
  if (err.fieldErrors) {
    const first = Object.values(err.fieldErrors)[0]
    if (first) return first
  }
  return err.message ?? '알 수 없는 오류가 발생했습니다.'
}
