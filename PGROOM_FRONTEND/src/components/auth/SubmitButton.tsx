import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isDisabled: boolean;
  buttonText: string;
}

/**
 * Submit button component for authentication forms
 */
const SubmitButton = ({ isDisabled, buttonText }: SubmitButtonProps) => (
  <Button
    type="submit"
    className="w-full bg-green-600 hover:bg-green-700 font-bold"
    disabled={isDisabled}
    aria-busy={isDisabled}
  >
    {isDisabled ? "Processing..." : buttonText}
  </Button>
);

export default SubmitButton;
