// import Economica from '../components/box-models/economica';

import { useSession } from 'next-auth/react';

function Produtos() {
  const { data: session } = useSession();
  const email = session.user.email;
  return (
    <>
      <iframe
        src={`http://ribermax.com/?token=b29cda672c7240256e46b7d68924e320&email=${email}`}
        height="100%"
        width={'100%'}
      />
    </>
  );
}

export default Produtos;
