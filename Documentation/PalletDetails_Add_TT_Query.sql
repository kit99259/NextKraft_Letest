-- TT is stored only in Omron FloorMapping (not on NextKraft PalletDetails).
-- If you already added PalletDetails.TT, drop it:
ALTER TABLE PalletDetails DROP COLUMN TT;
