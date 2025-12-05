import { extendTheme } from '@chakra-ui/react';

export const themeDark = extendTheme({
  fonts: {
    body: `'Inter', sans-serif`,
    heading: `'Inter', sans-serif`,
  },
  colors: {
    white: {
      100: "#FFFFFF"
    },
    bg: {
      100: '#1E1E2E',
      200: '#1A1A28',
      300: "#252535",
      400: "#16161F",
      'gradient': 'linear-gradient(135deg, #1E1E2E 0%, #252535 100%)',
    },
    blue: {
      100: "#A1A2FF",
      200: "#B5B6FF",
      300: "#8E8FFF",
      400: "#7172E8",
      500: "#A1A2FF",
      "gradient": 'linear-gradient(135deg, #A1A2FF 0%, #8E8FFF 100%);'
    },
    primary: {
      100: "#A1A2FF",
      200: "#B5B6FF",
      300: "#8E8FFF",
      400: "#7172E8",
      500: "#9091F5",
      "gradient": 'linear-gradient(135deg, #A1A2FF 0%, #8E8FFF 100%);'
    },
    gray: {
      100: "#2D2D3D",
      200: "#353545",
      300: "#4A4A5A",
    },
    error: "#FF6B6B"

  },
  components: {

    NumberInput: {
      baseStyle: {
        field: {
          h: "2.8rem",
          bg: "transparent",
          border: "1px solid",
          borderColor: "gray.200",
          color: "blue.100",
          _placeholder: {
            color: "blue.300",
            opacity: "30%",
          },
          _focus: {
            borderColor: "blue.400",
            outline: "none",
            border: "1px solid",
          },
          _focusVisible: {
            border: "none"
          },
          _hover: {
            borderColor: "gray.300",
          }
        },
      },
      defaultProps: {
        errorBorderColor: 'error',
        focusBorderColor: "blue.200",
      },
    },
    Input: {

      baseStyle: {
        field: {
          color: "blue.100",
          borderBottomColor: "bg.200",
          _placeholder: {
            color: "blue.100",
            opacity: "30%",
          },
          _disabled: {
            color: "gray.200",
            opacity: "80%",
          },

        },
      },
      variants: {
        node: {
          field: {
            h: "2.8rem",
            bg: "transparent",
            border: "1px solid",
            borderColor: "gray.200",
            color: "blue.100",
            _placeholder: {
              color: "blue.300",
              opacity: "30%",
            },
            _focus: {
              borderColor: "blue.400"
            }
          },
        }
      },
      defaultProps: {
        errorBorderColor: "error",
        focusBorderColor: "bg.300",
      },
    },
    Button: {
      baseStyle: {
        minWidth: "fit-content",
        fontWeight: "600",
        boxShadow: "4px 4px 0px -1px rgba(0, 0, 0, 0.15)",
      },
      variants: {
        filled: {
          bg: 'blue.400',
          color: 'white',
          w: "9rem",
          h: "3.8rem",
          fontSize: "1.9rem",
          borderRadius: "0.6rem",
          _hover: {
            filter: "brightness(120%)",
            _disabled: {
              bgColor: 'blue.500',
            },
          },
          _active: {
            transform: "scale(90%)",
          }
        },

        outline: {
          bg: 'transparent',
          color: 'blue.400',
          border: "1px solid",
          borderColor: "blue.400",
          w: "9rem",
          h: "3.8rem",
          fontSize: "1.9rem",
          borderRadius: "0.6rem",
          _hover: {
            bg: "transparent",
            filter: "brightness(120%)",
            _disabled: {
              bgColor: 'blue.500',
            },
          },
          _active: {
            bg: "transparent",
            transform: "scale(90%)",
          }
        },
        sidebar: {
          fontSize: "1.6rem",
          justifyContent: "space-between",
          padding: "0rem 2rem",
          w: "100%",
          boxShadow: "none",
          h: "4rem",
          transition: "100ms",
          bg: 'transparent',
          fontWeight: "500",
          _hover: {
            bg: "bg.300",
          },
          _active: {
            filter: "brightness(110%)",
            transform: "none",
          }
        },

        magenta: {
          fontSize: "1.5rem",
          borderRadius: "0.5rem",
          variant: "filled",
          color: "white",
          bg: "primary.100",
          _hover: {
            bg: "primary.200",
          },
          _active: {
            transform: "scale(90%)",
          }
        }
      },
    },

    Alert: {
      baseStyle: (props: any) => {
        const { status } = props;

        const base = {
          container: {
            m: "0 2rem",
            padding: "1rem 1rem",
            width: "5rem",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.5)",
          },
          icon: {
            width: "2rem",
            height: "2rem"
          },
          closeButton: {
            color: "white",
            _hover: {
              background: "white",
            },
          },
          title: {
            mt: "1px",
            fontSize: "1.8rem",
            color: "#e3e3e3",
            fontWeight: "500"
          }
        };

        const successBase = status === "success" && {
          container: {
            ...base.container,
            background: "linear-gradient(45deg, #29494f, #1a7558)",
          },
          icon: {
            ...base.icon,
            color: "#00D70F"
          },
          title: {
            ...base.title,
          },
        };

        const infoBase = status === "info" && {
          container: {
            ...base.container,
            background: "linear-gradient(45deg,#2d2d97, #5858a8)",
          },
          icon: {
            ...base.icon,
            color: "blue.100"
          },
          title: {
            ...base.title,
          },
        };

        const errorBase = status === "error" && {
          container: {
            ...base.container,
            background: "linear-gradient(45deg,#732020, #bb5050)",
          },
          icon: {
            ...base.icon,
            color: "red"
          },
          title: {
            ...base.title,
          },
        };

        const loadingBase = status === "loading" && {
          container: {
            ...base.container,
            background: "linear-gradient(45deg,#2d2d97, #5858a8)",
          },
          spinner: {
            ...base.icon,
            color: "white",

          },
          title: {
            ...base.title,
          },
        };
        return {
          ...base,
          ...successBase,
          ...infoBase,
          ...errorBase,
          ...loadingBase,
        };
      },
    },


  },
});
