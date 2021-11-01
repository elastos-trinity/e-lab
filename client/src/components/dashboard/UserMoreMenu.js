import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import { Menu, MenuItem, IconButton, ListItemText } from '@mui/material';
import PropTypes from 'prop-types';

UserMoreMenu.propTypes = {
  proposalId: PropTypes.string,
  handleAction: PropTypes.func
};

export default function UserMoreMenu({ proposalId, handleAction }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem sx={{ color: 'text.secondary' }} onClick={() => { handleAction('rejected', proposalId); setIsOpen(false) }}>
          <ListItemText primary="Reject" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem sx={{ color: 'text.secondary' }} onClick={() => { handleAction('approved', proposalId); setIsOpen(false) }}>
          <ListItemText primary="Approve" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
    </>
  );
}
