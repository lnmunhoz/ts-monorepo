import { CommonModule } from ".."

describe("Common", () => {
   test("value should be the 42", async (done) => {
      expect(CommonModule).toBe(42)

      done()
   })
})
