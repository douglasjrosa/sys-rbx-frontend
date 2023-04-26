
import { useSession } from 'next-auth/react';

function Produtos() {
  const { data: session } = useSession();
  const email = localStorage.getItem('email');
  return (
    <>
      <iframe
        src={`http://ribermax.com?Token=b29cda672c7240256e46b7d68924e320&Email=${email?.replace(/\"/g, '')}`}
        height="100%"
        width={'100%'}
      />
    </>
  );
}

export default Produtos;
