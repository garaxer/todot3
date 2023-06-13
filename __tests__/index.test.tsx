import { fireEvent, render, screen } from "@testing-library/react";
import Home from "../src/pages/index";
import { useSession } from "next-auth/react";
import "@testing-library/jest-dom";
jest.mock("next-auth/react");
// jest.mock("../src/utils/api");

// (api.example.hello.useQuery as jest.Mock).mockImplementation(() => ({
//   data:undefined
// }));
// (api.example.getSecretMessage.useQuery as jest.Mock).mockImplementation(() => ({
//   data:undefined
// }));

jest.mock("../src/utils/api", () => ({
  api: {
    example: {
      hello: {
        useQuery: jest.fn().mockImplementation(() => ({
          data: undefined,
        })),
      },
      getSecretMessage: {
        useQuery: jest.fn().mockImplementation(() => ({
          data: undefined,
        })),
      }
    },
  },
}));

const mockSession = {
  data: {
    expires: "1",
    user: { email: "a", name: "Delta", image: "c" },
  },
};

const useSessionMock = (useSession as jest.Mock)
useSessionMock.mockReturnValueOnce({data: mockSession});

describe("Home", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(<Home />);
  });
  it.only("renders a heading", () => {
    const heading = screen.getByRole("heading", {
      name: /Create t3 App/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it("allows you to enter a message", async () => {
    const guessInput = screen.getByPlaceholderText("Guess");

    expect(guessInput).toBeInTheDocument();

    fireEvent.change(guessInput, { target: { value: "11" } });
    fireEvent.keyDown(guessInput, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    const firstResponse = await screen.findByText(
      "Please enter the first number"
    );

    expect(firstResponse).toBeInTheDocument();

    fireEvent.change(guessInput, { target: { value: "10" } });

    const button = screen.getByRole("button", { name: "Send" });
    fireEvent.click(button);

    const secondResponse = await screen.findByText(
      "Please enter the next number"
    );

    expect(secondResponse).toBeInTheDocument();
  });
});
