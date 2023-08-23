import { IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { BsArrowLeftCircleFill } from "react-icons/bs";

export const BtmRetorno = (props: { Url: string }) => {
  const router = useRouter();
  return (
    <>
      <IconButton aria-label='voltar' rounded={'3xl'} onClick={() => router.push(props.Url)} icon={<BsArrowLeftCircleFill size={30} color="#136dcc" />} />
    </>
  );
};
