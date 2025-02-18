import { IoClose } from "react-icons/io5";
import { PiCopySimpleLight } from "react-icons/pi";


interface InvitationCardProps {
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    invitationLink: string;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ setIsModalOpen, invitationLink }) => {

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationLink).then(() => {
          alert('Invitation link copied to clipboard!');
        }).catch((error) => {
          console.error('Failed to copy text: ', error);
        });
      };

    return (
        <div className='fixed inset-0 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-md shadow-lg w-lg'>
                <div className='mb-6 w-full flex'>
                    <h2 className='text-emerald-500 text-3xl'>Invitation Link:</h2>
                    <button 
                        className='text-gray-400 text-2xl bg-gray-100 rounded-full h-fit hover:cursor-pointer hover:bg-gray-200 ml-auto'
                        onClick={() => setIsModalOpen(false)}
                    ><IoClose /></button>
                </div>

                <div className='flex items-center border-solid border-gray-200 border-1 rounded-md inset-shadow-xs w-full' >
                    <p className='text-sm text-gray-500 p-3'>{invitationLink}</p>
                    <button className='border-solid border-gray-200 border-l-1 p-3 ml-auto hover:cursor-pointer'
                        onClick={copyToClipboard}>
                        <PiCopySimpleLight />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InvitationCard
