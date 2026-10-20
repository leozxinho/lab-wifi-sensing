import { ThreeElements } from "@react-three/fiber";

declare module "*.css";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}
