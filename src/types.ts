export type PublicEntryRow = {
    public_id: string
    title: string
    message: string
    created_at: string
}

export type Entry = {
    // The frontend id is always the database-generated public_id.
    id: string
    title: string
    message: string
    createdAt: string
    local?: boolean
}
