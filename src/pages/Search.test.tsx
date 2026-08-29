import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ searchEntries: vi.fn() }))
vi.mock("../lib/api", () => ({ searchEntries: mocks.searchEntries }))

import Search, { loadSearchResults } from "./Search"

function deferred<T>() {
  let resolve = null as unknown as (value: T) => void
  let reject = null as unknown as (reason?: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

describe("Search", () => {
  beforeEach(() => mocks.searchEntries.mockReset())

  it("does not search an empty or one-character query", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>,
    )
    await user.type(
      screen.getByLabelText("Search public entries by title"),
      "a",
    )
    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(mocks.searchEntries).not.toHaveBeenCalled()
  })

  it("does not let a stale response overwrite current results", async () => {
    const user = userEvent.setup()
    const oldRequest = deferred<unknown[]>()
    const newRequest = deferred<unknown[]>()
    mocks.searchEntries
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise)
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>,
    )
    const input = screen.getByLabelText("Search public entries by title")
    await user.type(input, "old")
    await waitFor(
      () => expect(mocks.searchEntries).toHaveBeenCalledWith("old"),
      { timeout: 1000 },
    )
    await user.clear(input)
    await user.type(input, "new")
    await waitFor(
      () => expect(mocks.searchEntries).toHaveBeenCalledWith("new"),
      { timeout: 1000 },
    )
    newRequest.resolve([
      {
        id: "new",
        title: "New result",
        message: "Message",
        createdAt: "2026-01-01",
      },
    ])
    expect(await screen.findByText("New result")).toBeInTheDocument()
    oldRequest.resolve([
      {
        id: "old",
        title: "Old result",
        message: "Message",
        createdAt: "2026-01-01",
      },
    ])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(screen.queryByText("Old result")).not.toBeInTheDocument()
  })

  it("keeps request failure distinct from an empty result", async () => {
    const result = await loadSearchResults(
      "quiet",
      vi.fn().mockRejectedValue(new Error("network")),
    )
    expect(result).toEqual({ ok: false })
  })

  it("rejects wildcard-only searches", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>,
    )
    await user.type(
      screen.getByLabelText("Search public entries by title"),
      "%__%",
    )
    expect(
      screen.getByText("Enter at least two letters or numbers"),
    ).toBeInTheDocument()
    expect(mocks.searchEntries).not.toHaveBeenCalled()
  })
})
