import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  submitEntry: vi.fn(),
  saveToHistory: vi.fn(),
}))
vi.mock("../lib/api", async () => {
  class EntrySubmissionError extends Error {
    constructor(public status?: number) {
      super()
    }
  }
  return { submitEntry: mocks.submitEntry, EntrySubmissionError }
})
vi.mock("../lib/history", () => ({ saveToHistory: mocks.saveToHistory }))

import Write from "./Write"

function renderWrite() {
  return render(
    <MemoryRouter initialEntries={["/write"]}>
      <Routes>
        <Route path="/write" element={<Write />} />
        <Route path="/entry/:id" element={<p>Entry destination</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("Write", () => {
  beforeEach(() => {
    mocks.submitEntry.mockReset()
    mocks.saveToHistory.mockReset()
  })

  it("navigates using the returned public ID", async () => {
    const user = userEvent.setup()
    mocks.submitEntry.mockResolvedValue({
      id: "public-id",
      title: "Title",
      message: "Message",
      createdAt: "2026-01-01",
    })
    renderWrite()
    await user.type(screen.getByLabelText("Title"), "Title")
    await user.type(screen.getByLabelText("Message"), "Message")
    await user.click(screen.getByRole("button", { name: "Submit anonymously" }))
    expect(await screen.findByText("Entry destination")).toBeInTheDocument()
    expect(mocks.saveToHistory).toHaveBeenCalledWith(
      expect.objectContaining({ id: "public-id" }),
    )
  })

  it("shows a retryable failure", async () => {
    const user = userEvent.setup()
    mocks.submitEntry
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        id: "retry",
        title: "Title",
        message: "Message",
        createdAt: "2026-01-01",
      })
    renderWrite()
    await user.type(screen.getByLabelText("Title"), "Title")
    await user.type(screen.getByLabelText("Message"), "Message")
    await user.click(screen.getByRole("button", { name: "Submit anonymously" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong",
    )
    await user.click(screen.getByRole("button", { name: "Submit anonymously" }))
    expect(await screen.findByText("Entry destination")).toBeInTheDocument()
  })

  it("prevents repeated submission while pending", async () => {
    const user = userEvent.setup()
    let resolve = null as unknown as (value: unknown) => void
    mocks.submitEntry.mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    renderWrite()
    await user.type(screen.getByLabelText("Title"), "Title")
    await user.type(screen.getByLabelText("Message"), "Message")
    const button = screen.getByRole("button", { name: "Submit anonymously" })
    await user.dblClick(button)
    expect(mocks.submitEntry).toHaveBeenCalledTimes(1)
    await act(() => {
      resolve({
        id: "one",
        title: "Title",
        message: "Message",
        createdAt: "2026-01-01",
      })
      return Promise.resolve()
    })
  })

  it("does not submit empty values", async () => {
    renderWrite()
    expect(
      screen.getByRole("button", { name: "Submit anonymously" }),
    ).toBeDisabled()
  })

  it("accepts a 90-character title and caps further input", async () => {
    renderWrite()
    const title = screen.getByLabelText("Title")
    fireEvent.change(title, { target: { value: "a".repeat(90) } })
    expect(title).toHaveValue("a".repeat(90))
    expect(title).toHaveAttribute("maxlength", "90")
  })

  it("accepts a 1,400-character message and caps further input", async () => {
    renderWrite()
    const message = screen.getByLabelText("Message")
    fireEvent.change(message, { target: { value: "a".repeat(1400) } })
    expect(message).toHaveValue("a".repeat(1400))
    expect(message).toHaveAttribute("maxlength", "1400")
  })
})
