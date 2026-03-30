import { useEffect, useState } from "react";
import axios from "axios";
function AssetList() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/assets")
      .then(res => setAssets(res.data));
  }, []);

  return (
    <div>
      <h2>Danh sách tài sản TDMU</h2>
      {/* <ul>
        {assets.map(asset => (
          <li key={asset.id}>
            {asset.name} - {asset.status}
          </li>
        ))}
      </ul> */}
    </div>
  );
}

export default AssetList;
