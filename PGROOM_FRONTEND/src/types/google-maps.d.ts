declare namespace google {
  namespace maps {
    namespace places {
      class Autocomplete {
        constructor(
          inputField: HTMLInputElement,
          options?: AutocompleteOptions
        );
        addListener(eventName: string, handler: () => void): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        componentRestrictions?: {
          country: string | string[];
        };
        fields?: string[];
        types?: string[];
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        formatted_address?: string;
        geometry?: {
          location: {
            lat: () => number;
            lng: () => number;
          };
        };
        name?: string;
        place_id?: string;
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }
    }
  }
}
