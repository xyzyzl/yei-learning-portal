import { db } from './firebase-admin'

export async function getSlideProgress(slideId) {
  const doc = await db.collection('slides').doc(slideId).get()
  const progress = { id: doc.id, ...doc.data() }

  return { progress }
}

export async function getAllUserDataIds(userId) {
  try {
    const slidesRef = db.collection('slides')
    const mcqsRef = db.collection('mcqs')
    const frqsRef = db.collection('frqs')
    const slidesSnapshot = await slidesRef.get()
    const mcqsSnapshot = await mcqsRef.get()
    const frqsSnapshot = await frqsRef.get()

    const allUserIds = []

    slidesSnapshot.forEach((doc, index) => {
      const id = doc.id
      allUserIds.push({ id, ...doc.data() })
    })

    mcqsSnapshot.forEach((doc, index) => {
      const id = doc.id
      allUserIds.push({ id, ...doc.data() })
    })

    frqsSnapshot.forEach((doc, index) => {
      const id = doc.id
      allUserIds.push({ id, ...doc.data() })
    })

    // docIds.forEach((id) => {
    //   db.collection('slides')
    //     .doc(id)
    //     .delete()
    //     .then(() => console.log('success! dleetion'))
    //     .error(() => console.log('error deleteion'))
    // })

    return { allUserIds }
  } catch (error) {
    return { error }
  }
}

export async function getAllSlideProgress(path, userId) {
  try {
    let ref
    if (path.length === 1) {
      ref = db
        .collection('slides')
        .where('userId', '==', userId)
        .where('category', '==', path[0])
    } else if (path.length === 0) {
      ref = db.collection('slides').where('userId', '==', userId)
    } else if (path.length === 3) {
      ref = db
        .collection('slides')
        .where('userId', '==', userId)
        .where('category', '==', path[0])
        .where('chapter', '==', path[1])
    }

    const snapshot = await ref.get()
    const progress = []

    snapshot.forEach((doc, index) => {
      progress.push({ id: doc.id, ...doc.data() })
    })
    return { progress }
  } catch (error) {
    return { error }
  }
}

export async function getAllMCQScores(path, userId) {
  try {
    let ref
    if (path.length === 1) {
      ref = db
        .collection('mcqs')
        .where('userId', '==', userId)
        .where('category', '==', path[0])
    } else if (path.length === 0) {
      ref = db.collection('mcqs').where('userId', '==', userId)
    } else if (path.length === 3) {
      ref = db
        .collection('mcqs')
        .where('userId', '==', userId)
        .where('category', '==', path[0])
        .where('chapter', '==', path[1])
    }

    const snapshot = await ref.get()
    const score = []

    snapshot.forEach((doc, index) => {
      score.push({ id: doc.id, ...doc.data() })
    })
    return { score }
  } catch (error) {
    return { error }
  }
}
export async function getAllFRQScores(path, num, userId) {
  try {
    let ref
    if (path.length === 1) {
      ref = db
        .collection('frqs')
        .where('userId', '==', userId)
        .where('category', '==', path[0])
    } else if (path.length === 0) {
      ref = db.collection('frqs').where('userId', '==', userId)
    } else if (path.length === 3) {
      ref = db
        .collection('frqs')
        .where('userId', '==', userId)
        .where('category', '==', path[0])
        .where('chapter', '==', path[1])
        .where('num', '==', num)
    }

    const snapshot = await ref.get()
    const score = []

    snapshot.forEach((doc, index) => {
      score.push({ id: doc.id, ...doc.data() })
    })
    // console.log({ userId, path, num, score })
    return { score }
  } catch (error) {
    return { error }
  }
}
