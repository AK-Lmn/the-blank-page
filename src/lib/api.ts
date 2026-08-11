import type { Entry } from "../types"

const publicEntries: Entry[] = [
  { id: "p-1", title: "A quieter kind of brave", message: "I said no today without explaining myself. It felt strange at first, then it felt like opening a window in a room I did not realize was close.", createdAt: "Today" },
  { id: "p-2", title: "For the version of me who kept going", message: "I am learning that rest is not something to earn. There are small things worth staying for: the kettle beginning to sing, clean sheets, the first cool minute after rain.", createdAt: "Yesterday" },
  { id: "p-3", title: "Still becoming", message: "Maybe it is enough to be unfinished. Maybe the parts of me that feel uncertain are simply making room for something new.", createdAt: "2 days ago" },
]

export async function getPublicEntries(): Promise<Entry[]> {
  return publicEntries
}

export async function getPublicEntry(id: string): Promise<Entry | undefined> {
  return publicEntries.find((entry) => entry.id === id)
}
