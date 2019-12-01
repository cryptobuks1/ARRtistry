import * as React from 'react';
import Card from 'react-bootstrap/Card';
import PlaintextField from './common/PlaintextField';
import AddressField from './common/AddressField';
import Form from 'react-bootstrap/Form';
import { useContractContext } from '../providers/ContractProvider';

interface ArrItemProps {
  id: number;
}

interface ArrItemType {
  from: string;
  to: string;
  tokenId: number;
  price: number;
  arr: number;
  location: string;
  paid: boolean;
}

const ArrItem: React.FC<ArrItemProps> = ({ id }) => {
  const [arr, setArr] = React.useState<ArrItemType>();

  const { ArrRegistry } = useContractContext();

  React.useEffect(() => {
    const loadArr = async (): Promise<void> => {
      const arrData = await ArrRegistry.methods.retrieve(id).call();
      const arr = {
        from: arrData.from,
        to: arrData.to,
        tokenId: arrData.tokenId,
        price: arrData.price / 100,
        arr: arrData[4] / 100,
        location: arrData.location,
        paid: arrData.paid
      };
      console.log(arrData);
      setArr(arr);
    };

    loadArr();
  }, [ArrRegistry, id]);

  if (!arr) {
    return null;
  }

  return (
    <Card>
      <Card.Body>
  <Card.Title><span className="text-muted text-capitalize">#{id} {arr.paid ? 'Paid' : 'Outstanding'}</span></Card.Title>
        <Card.Subtitle className="mb-2 text-muted"></Card.Subtitle>
        <Form>
          <PlaintextField label='Piece' value={arr.tokenId.toString()} />
          <AddressField label='Buyer' address={arr.to}/>
          <AddressField label='Seller' address={arr.from}/>
          <PlaintextField label='Sale Location' value={arr.location} />
          <PlaintextField label='Sale Price' value={'€' + arr.price} />
          <PlaintextField label='ARR' value={'€' + arr.arr} />
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ArrItem;
